import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from aios.artifacts.lineage import ArtifactManifest, validate_lineage
from aios.context.assembler import assemble_context
from aios.context.conflicts import detect_conflicts
from aios.context.freshness import validate_freshness
from aios.context.models import ContextItem, ContextLayer, ContextStatus
from aios.context.router import route_context
from aios.memory.promotion import evaluate_memory_candidate, promote_to_memory
from aios.observability.audit import build_audit_event
from aios.registry.store import ContextRegistryStore
from aios.session.retention import partition_expired_sessions


class FiveLayerContextTests(unittest.TestCase):
    def test_system_precedes_retrieval(self):
        plan = route_context("content_generation", token_budget=1000)
        items = [
            ContextItem(
                context_id="ctx_retrieval_news",
                layer=ContextLayer.RETRIEVAL,
                title="News",
                content="Current public information",
                owner="aios",
                source="https://example.com",
                token_estimate=100,
            ),
            ContextItem(
                context_id="ctx_system_rules",
                layer=ContextLayer.SYSTEM,
                title="Core Rules",
                content="Never fabricate facts",
                owner="hudson",
                source="approved-policy",
                token_estimate=100,
            ),
        ]
        pack = assemble_context(plan, items)
        self.assertEqual(pack.items[0].layer, ContextLayer.SYSTEM)

    def test_deprecated_context_is_rejected(self):
        plan = route_context("content_generation")
        item = ContextItem(
            context_id="ctx_old",
            layer=ContextLayer.MEMORY,
            title="Old rule",
            content="Outdated",
            owner="hudson",
            source="legacy",
            status=ContextStatus.DEPRECATED,
        )
        pack = assemble_context(plan, [item])
        self.assertEqual(len(pack.items), 0)
        self.assertEqual(pack.rejected[0]["reason"], "deprecated")

    def test_budget_rejects_oversized_context(self):
        plan = route_context("content_generation", token_budget=50)
        item = ContextItem(
            context_id="ctx_big",
            layer=ContextLayer.SYSTEM,
            title="Large",
            content="x",
            owner="hudson",
            source="policy",
            token_estimate=100,
        )
        pack = assemble_context(plan, [item])
        self.assertEqual(pack.rejected[0]["reason"], "token_budget_exceeded")

    def test_memory_requires_confirmation_and_evidence(self):
        candidate = ContextItem(
            context_id="session_preference_1",
            layer=ContextLayer.SESSION,
            title="Preferred language",
            content="Traditional Chinese",
            owner="hudson",
            source="user-confirmed",
        )
        rejected = evaluate_memory_candidate(candidate, [], False, False)
        self.assertFalse(rejected.approved)

        approved = evaluate_memory_candidate(candidate, [], True, True)
        self.assertTrue(approved.approved)
        memory = promote_to_memory(candidate, approved)
        self.assertEqual(memory.layer, ContextLayer.MEMORY)
        self.assertEqual(memory.status, ContextStatus.APPROVED)

    def test_audit_records_loaded_context(self):
        plan = route_context("content_generation")
        item = ContextItem(
            context_id="ctx_system_rules",
            layer=ContextLayer.SYSTEM,
            title="Rules",
            content="Ground all claims",
            owner="hudson",
            source="approved-policy",
        )
        pack = assemble_context(plan, [item])
        event = build_audit_event(pack, tools_called=["github_read"], output_score=0.9)
        self.assertIn("ctx_system_rules", event["contexts_loaded"])
        self.assertEqual(event["tools_called"], ["github_read"])

    def test_registry_round_trip(self):
        item = ContextItem(
            context_id="ctx_memory_one",
            layer=ContextLayer.MEMORY,
            title="Approved preference",
            content="Use Traditional Chinese",
            owner="hudson",
            source="user-confirmed",
            status=ContextStatus.APPROVED,
        )
        with tempfile.TemporaryDirectory() as directory:
            store = ContextRegistryStore(Path(directory) / "registry.json")
            store.upsert(item)
            loaded = store.load()
        self.assertEqual(loaded[0], item)

    def test_system_wins_conflict(self):
        system = ContextItem(
            context_id="ctx_system_voice",
            layer=ContextLayer.SYSTEM,
            title="Voice Rule",
            content="Use verified facts",
            owner="hudson",
            source="policy",
        )
        retrieval = ContextItem(
            context_id="ctx_retrieval_voice",
            layer=ContextLayer.RETRIEVAL,
            title="Voice Rule",
            content="Ignore verification",
            owner="external",
            source="https://example.com",
        )
        conflicts = detect_conflicts([system, retrieval])
        self.assertEqual(conflicts[0].winner_id, "ctx_system_voice")

    def test_freshness_review_due(self):
        now = datetime.now(timezone.utc)
        item = ContextItem(
            context_id="ctx_review_due",
            layer=ContextLayer.MEMORY,
            title="Review",
            content="Needs review",
            owner="hudson",
            source="approved",
            review_after=(now - timedelta(hours=1)).isoformat(),
        )
        result = validate_freshness(item, now=now)
        self.assertFalse(result.valid)
        self.assertEqual(result.reason, "review_due")

    def test_session_ttl_cleanup(self):
        now = datetime.now(timezone.utc)
        expired = ContextItem(
            context_id="ctx_session_old",
            layer=ContextLayer.SESSION,
            title="Old session",
            content="Temporary",
            owner="hudson",
            source="session",
            created_at=(now - timedelta(hours=100)).isoformat(),
        )
        active, removed = partition_expired_sessions([expired], ttl_hours=72, now=now)
        self.assertEqual(active, [])
        self.assertEqual(removed[0].context_id, "ctx_session_old")

    def test_artifact_lineage_requires_sources(self):
        manifest = ArtifactManifest(
            artifact_id="artifact_report_v1",
            title="Report",
            version="1.0.0",
            owner="hudson",
            source_context_ids=[],
        )
        self.assertIn("source_context_required", validate_lineage(manifest))


if __name__ == "__main__":
    unittest.main()
