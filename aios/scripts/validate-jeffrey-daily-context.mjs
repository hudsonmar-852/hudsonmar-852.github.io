import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDailyContext } from '../services/daily-context/validator.js';
import { duplicateCheck } from '../modules/jeffrey/anti-repetition.js';

const aiosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(aiosRoot, '..');
const moduleRoot = path.join(aiosRoot, 'modules/jeffrey');
const latestFile = path.join(moduleRoot, 'latest.json');

if (!fs.existsSync(latestFile)) {
  console.log('Jeffrey latest.json is absent; feature has not produced a daily record yet.');
  process.exit(0);
}

const readJson = (filename) => JSON.parse(fs.readFileSync(filename, 'utf8'));
const resolvePublic = (value) => path.join(repositoryRoot, value.replace(/^\/+/, ''));
const latest = readJson(latestFile);

if (latest.status !== 'draft_human_approval_required') throw new Error('Latest output must remain a draft');
if (latest.feature_flag !== 'AIOS_DAILY_CONTEXT_V1') throw new Error('Unexpected feature flag');

const contextFile = resolvePublic(latest.daily_context_url);
const catalogueFile = resolvePublic(latest.daily_catalogue_url);
const qaFile = resolvePublic(latest.qa_report_url);
const reportFile = resolvePublic(latest.execution_report_url);
for (const filename of [contextFile, catalogueFile, qaFile, reportFile]) {
  if (!fs.existsSync(filename)) throw new Error(`Missing latest asset: ${path.relative(repositoryRoot, filename)}`);
}

const context = readJson(contextFile);
const contextValidation = validateDailyContext(context);
if (!contextValidation.valid) throw new Error(`Daily context invalid: ${contextValidation.errors.join(', ')}`);

const catalogue = readJson(catalogueFile);
if (catalogue.status !== 'draft_human_approval_required') throw new Error('Catalogue is not a draft');
if (catalogue.merge_policy?.mode !== 'prepend_new_preserve_old') throw new Error('Catalogue prepend policy missing');
if (catalogue.merge_policy?.preserve_existing_reminders !== true) throw new Error('Historical preservation missing');
if (catalogue.merge_policy?.overwrite_existing !== false) throw new Error('Overwrite protection missing');

const dailyFive = catalogue.new_reminders?.daily_five;
if (!Array.isArray(dailyFive) || dailyFive.length !== 5) {
  throw new Error('Catalogue must contain exactly five daily messages');
}
if (catalogue.creation_policy?.topic_mode !== 'single_fused_topic') {
  throw new Error('Single fused topic policy missing');
}
if (catalogue.creation_policy?.group_sorting !== false) {
  throw new Error('Group sorting must remain disabled');
}

const allReminders = Object.values(catalogue.new_reminders).flat();
for (const reminder of allReminders) {
  if (reminder.status !== 'draft_human_approval_required' || reminder.approval_status !== 'pending') {
    throw new Error(`Reminder ${reminder.id} bypasses human approval`);
  }
  if (reminder.context_specific) {
    if (!/^\/aios\/.+\.json(?:#.*)?$/.test(reminder.source_url || '')) {
      throw new Error(`Context source must point to a stored AIOS record: ${reminder.id}`);
    }
    if (/data\.weather\.gov\.hk|weatherAPI\/opendata/.test(reminder.source_url)) {
      throw new Error(`Raw weather API exposed by ${reminder.id}`);
    }
    if (!reminder.source_line) throw new Error(`Missing source line: ${reminder.id}`);
  }
}

for (let index = 0; index < allReminders.length; index += 1) {
  const check = duplicateCheck(allReminders[index].text, allReminders.slice(0, index));
  if (check.decision === 'block') throw new Error(`Blocked duplicate in latest catalogue: ${allReminders[index].id}`);
}

for (const reference of catalogue.merge_policy.historical_catalogue_refs || []) {
  if (!fs.existsSync(resolvePublic(reference))) throw new Error(`Missing history reference: ${reference}`);
}

const generatorSource = fs.readFileSync(path.join(moduleRoot, 'generator.js'), 'utf8');
if (/data\.weather\.gov\.hk|weatherAPI\/opendata|fetch\s*\(/.test(generatorSource)) {
  throw new Error('Jeffrey generator must not call a raw weather API');
}

const qa = readJson(qaFile);
if (!String(qa.status).startsWith('pass')) throw new Error('QA report is not passing');
const execution = readJson(reportFile);
if (execution.output_status !== 'draft_human_approval_required') throw new Error('Execution report draft gate missing');
if (execution.old_reminders_preserved !== true || execution.new_reminders_prepended !== true) {
  throw new Error('Execution report preservation contract missing');
}

console.log(
  `Validated Jeffrey Daily Context ${context.date}: ${allReminders.length} drafts, `
  + `${allReminders.filter((item) => item.context_specific).length} context-specific, `
  + `${context.source_records.length} source records.`
);
