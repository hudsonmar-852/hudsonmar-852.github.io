import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { duplicateCheck } from './anti-repetition.js';
import { qaDraft, rewriteOnce } from './qa.js';
import { contextTemplatePool, EVERGREEN_TEMPLATES } from './templates.js';
import { messageAngle } from '../../services/daily-context/audience-mapper.js';

const DRAFT_STATUS = 'draft_human_approval_required';
const CATEGORY_ORDER = [
  'hydration',
  'stretching_mobility',
  'breathing_rhythm',
  'training_intensity',
  'recovery_rest',
  'daily_care'
];
const REWRITE_OPENINGS = ['提提你，', '順帶一提，', '今日想提你，', '出門之前，', '忙完呢轉，'];

function stableId(parts) {
  return `jdc-${crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16)}`;
}

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJsonFiles(filename);
    return entry.name.endsWith('.json') ? [filename] : [];
  });
}

export function loadReminderHistory(catalogueDirectory) {
  const history = [];
  const references = [];
  for (const filename of listJsonFiles(catalogueDirectory).sort()) {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (!data.catalogue_date || !data.new_reminders) continue;
    references.push(filename);
    for (const [category, reminders] of Object.entries(data.new_reminders)) {
      if (!Array.isArray(reminders)) continue;
      for (const reminder of reminders) {
        const text = typeof reminder === 'string' ? reminder : reminder.text;
        if (text) history.push({ text, date: data.catalogue_date, category, source_file: filename });
      }
    }
  }
  return { history, references };
}

function baseDraft({ date, category, text, index }) {
  return {
    id: stableId([date, category, text]),
    text,
    category,
    status: DRAFT_STATUS,
    approval_status: 'pending',
    context_specific: false,
    context_status: 'evergreen',
    generated_order: index,
    source_line: null,
    source_url: null,
    source_record_id: null,
    audience_segments: [],
    freshness_score: null,
    confidence_score: null,
    rewrite_count: 0
  };
}

function contextDraft({ date, topic, text, index }) {
  const segment = topic.audience_segments[0] || 'general_wellness';
  return {
    ...baseDraft({ date, category: 'daily_five', text, index }),
    id: stableId([date, topic.id, text]),
    context_specific: true,
    context_status: 'validated',
    context_type: topic.type,
    audience_segments: topic.audience_segments,
    message_angle: messageAngle(topic.type, segment),
    source_record_id: topic.source_record_id,
    source_line: `AIOS Daily Context · ${topic.title}`,
    source_url: topic.record_url,
    source_records: topic.source_records,
    fused_topic: topic.title,
    freshness_score: topic.freshness_score,
    confidence_score: topic.confidence_score
  };
}

function rewriteForDuplicate(draft, index) {
  const withoutOpening = draft.text.replace(/^(今日|今朝|今晚|提提你|順帶一提)[，,\s]*/, '');
  return rewriteOnce({
    ...draft,
    text: `${REWRITE_OPENINGS[index % REWRITE_OPENINGS.length]}${withoutOpening}`
  });
}

function validateCandidate(draft, history, report, nowDate, rewriteIndex) {
  let duplicate = duplicateCheck(draft.text, history, { nowDate });
  let qa = qaDraft(draft, { duplicate });
  report.attempted += 1;
  if (qa.passes) {
    report.duplicate_checks.push({ id: draft.id, ...duplicate });
    return { draft: { ...draft, qa: qa.scores }, qa };
  }

  const rewritten = duplicate.decision === 'pass'
    ? rewriteOnce(draft)
    : rewriteForDuplicate(draft, rewriteIndex);
  duplicate = duplicateCheck(rewritten.text, history, { nowDate });
  qa = qaDraft(rewritten, { duplicate });
  report.rewritten += 1;
  report.duplicate_checks.push({ id: draft.id, ...duplicate });
  if (qa.passes) return { draft: { ...rewritten, qa: qa.scores }, qa };
  report.excluded.push({ id: draft.id, text: draft.text, failures: qa.failures });
  return null;
}

function generateEvergreenCategory({ date, category, history, report }) {
  const selected = [];
  for (const [index, text] of EVERGREEN_TEMPLATES[category].entries()) {
    if (selected.length === 5) break;
    const candidate = baseDraft({ date, category, text, index });
    const result = validateCandidate(candidate, [...history, ...selected], report, date, index);
    if (result) selected.push(result.draft);
  }
  if (selected.length !== 5) {
    throw new Error(`Unable to produce five QA-passing reminders for ${category}`);
  }
  return selected;
}

function generateEvergreenFive({ date, history, report }) {
  const selected = [];
  const offset = Number(date.replaceAll('-', '')) % CATEGORY_ORDER.length;
  const categories = [...CATEGORY_ORDER.slice(offset), ...CATEGORY_ORDER.slice(0, offset)];
  for (let round = 0; round < 8 && selected.length < 5; round += 1) {
    for (const category of categories) {
      if (selected.length === 5) break;
      const text = EVERGREEN_TEMPLATES[category][round];
      if (!text) continue;
      const candidate = {
        ...baseDraft({ date, category: 'daily_five', text, index: selected.length }),
        message_angle: category,
        fused_topic: '今日生活同訓練節奏'
      };
      const result = validateCandidate(candidate, [...history, ...selected], report, date, round);
      if (result) selected.push(result.draft);
    }
  }
  if (selected.length !== 5) throw new Error('Unable to produce five QA-passing daily reminders');
  return selected;
}

function attachTopicScores(topic, context) {
  const record = context.source_records.find((item) => item.record_id === topic.source_record_id);
  return {
    ...topic,
    freshness_score: record?.freshness_score || 0,
    confidence_score: record?.confidence_score || 0
  };
}

function fuseTopics(context) {
  const topics = context.topic_candidates.map((topic) => attachTopicScores(topic, context));
  if (!topics.length) return null;
  const primary = topics[0];
  const sourceRecords = topics.map((topic) => ({
    record_id: topic.source_record_id,
    record_url: topic.record_url,
    title: topic.title,
    type: topic.type,
    freshness_score: topic.freshness_score,
    confidence_score: topic.confidence_score
  }));
  return {
    ...primary,
    title: topics.map((topic) => topic.title).filter(Boolean).slice(0, 3).join(' · '),
    audience_segments: [...new Set(topics.flatMap((topic) => topic.audience_segments))],
    source_records: sourceRecords
  };
}

function generateContextSpecific({ date, context, history, report }) {
  if (context.validation.status !== 'pass' || !context.topic_candidates.length) return [];
  const selected = [];
  const topic = fuseTopics(context);
  for (let round = 0; round < 10 && selected.length < 5; round += 1) {
    const pool = contextTemplatePool(topic.type);
    const text = pool[round % pool.length];
    const candidate = contextDraft({ date, topic, text, index: round });
    const result = validateCandidate(candidate, [...history, ...selected], report, date, round);
    if (result) selected.push(result.draft);
  }
  if (selected.length !== 5) {
    report.excluded.push({
      id: 'context-batch',
      failures: ['insufficient_qa_passing_daily_messages'],
      produced: selected.length
    });
    return [];
  }
  return selected;
}

export function generateDailyCatalogue({ date, context, history = [], historyRefs = [] }) {
  const report = {
    attempted: 0,
    rewritten: 0,
    excluded: [],
    duplicate_checks: []
  };
  const contextReminders = generateContextSpecific({ date, context, history, report });
  const dailyFive = contextReminders.length === 5
    ? contextReminders
    : generateEvergreenFive({ date, history, report });
  const newReminders = { daily_five: dailyFive };
  const contextStatus = contextReminders.length === 5 ? 'validated' : 'evergreen_only';
  const totalEvergreen = contextStatus === 'validated' ? 0 : dailyFive.length;
  const fusedTopic = contextStatus === 'validated'
    ? dailyFive[0].fused_topic
    : '今日生活同訓練節奏';
  const catalogue = {
    schema_version: '3.0',
    catalogue_date: date,
    status: DRAFT_STATUS,
    context_status: contextStatus,
    daily_context_record_url: `/aios/modules/jeffrey/context/${date}-daily-context.json`,
    merge_policy: {
      mode: 'prepend_new_preserve_old',
      preserve_existing_reminders: true,
      new_reminders_position: 'top',
      overwrite_existing: false,
      historical_catalogue_refs: historyRefs
    },
    quality_policy: {
      one_message_one_purpose: true,
      max_gentle_actions: 1,
      avoid_forced_fitness_angle: true,
      avoid_medical_claims: true,
      avoid_excessive_emojis: true,
      avoid_generic_ai_phrasing: true,
      human_approval_required: true
    },
    creation_policy: {
      messages_per_day: 5,
      topic_mode: 'single_fused_topic',
      source_mode: 'combined_validated_aios_records',
      group_sorting: false
    },
    fused_topic: fusedTopic,
    new_reminders: newReminders,
    qa_summary: {
      context_specific_reminders: contextReminders.length,
      context_block_reason: contextStatus === 'validated' ? null : 'insufficient_validated_context',
      new_categories: 1,
      new_per_category: 5,
      new_evergreen_reminders: totalEvergreen,
      total_new_reminders: dailyFive.length,
      duplicate_check: report.duplicate_checks.every((item) => item.decision === 'pass') ? 'passed' : 'passed_after_rewrite',
      old_reminders_preserved: true,
      human_approval_required: true,
      excluded_after_rewrite: report.excluded.length
    }
  };
  const qaReport = {
    schema_version: '1.0',
    date,
    status: report.excluded.length ? 'pass_with_exclusions' : 'pass',
    thresholds: {
      jeffrey_voice_min: 90,
      warm_heart_min: 90,
      reply_likelihood_min: 75,
      ai_smell_max: 10
    },
    attempted: report.attempted,
    rewritten_once: report.rewritten,
    excluded_after_rewrite: report.excluded,
    accepted_ids: Object.values(newReminders).flat().map((item) => item.id)
  };
  const executionReport = {
    schema_version: '1.0',
    date,
    feature_flag: 'AIOS_DAILY_CONTEXT_V1',
    context_status: contextStatus,
    output_status: DRAFT_STATUS,
    old_reminders_preserved: true,
    new_reminders_prepended: true,
    context_specific_count: contextReminders.length,
    evergreen_count: totalEvergreen,
    fused_topic: fusedTopic,
    daily_message_count: dailyFive.length,
    duplicate_check_results: report.duplicate_checks,
    excluded_items: report.excluded,
    source_records_considered: context.source_records.length,
    source_records_accepted: context.source_records.filter((item) => item.decision === 'accepted').length,
    source_records_rejected: context.source_records.filter((item) => item.decision !== 'accepted').length
  };
  return { catalogue, qaReport, executionReport };
}

export { DRAFT_STATUS, CATEGORY_ORDER };
