import unittest

from aios.context.assembler import assemble_context
from aios.context.models import ContextItem, ContextLayer, ContextStatus
from aios.context.router import route_context
from aios.memory.promotion import evaluate_memory_candidate, promote_to_memory
from aios.observability.audit import build_audit_event


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

    def test_audit_records_loaded_and_rejected_context(self):
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


if __name__ == "__main__":
    unittest.main()
