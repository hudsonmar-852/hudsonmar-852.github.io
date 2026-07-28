import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectFromRepository, featureEnabled } from '../../services/daily-context/index.js';
import { generateDailyCatalogue, loadReminderHistory } from './generator.js';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(moduleDirectory, '../../..');

function argumentValue(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : null;
}

function hkDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
}

function publicPath(repositoryRoot, filename) {
  return `/${path.relative(repositoryRoot, filename).replaceAll(path.sep, '/')}`;
}

function ensureDirectories(files) {
  for (const filename of files) fs.mkdirSync(path.dirname(filename), { recursive: true });
}

function writeAppendOnlyJson(outputs) {
  const historical = outputs.filter((output) => output.appendOnly);
  const existing = historical.filter((output) => fs.existsSync(output.filename));
  if (existing.length) {
    const missing = historical.filter((output) => !fs.existsSync(output.filename));
    if (missing.length) {
      throw new Error(`Partial existing daily run; refusing overwrite: ${existing.map((item) => item.filename).join(', ')}`);
    }
    return { written: [], reused: historical.map((item) => item.filename) };
  }
  ensureDirectories(outputs.map((output) => output.filename));
  const temporary = outputs.map((output) => ({
    ...output,
    temporary: `${output.filename}.tmp-${process.pid}`
  }));
  try {
    for (const output of temporary) {
      fs.writeFileSync(output.temporary, `${JSON.stringify(output.value, null, 2)}\n`, { flag: 'wx' });
    }
    for (const output of temporary.filter((item) => item.appendOnly)) {
      if (fs.existsSync(output.filename)) throw new Error(`Append-only output already exists: ${output.filename}`);
      fs.renameSync(output.temporary, output.filename);
    }
    for (const output of temporary.filter((item) => !item.appendOnly)) {
      fs.renameSync(output.temporary, output.filename);
    }
  } finally {
    for (const output of temporary) {
      if (fs.existsSync(output.temporary)) fs.unlinkSync(output.temporary);
    }
  }
  return { written: outputs.map((item) => item.filename), reused: [] };
}

export function runDaily({
  repositoryRoot = defaultRepositoryRoot,
  date = hkDate(),
  now = new Date(),
  environment = process.env,
  write = true
} = {}) {
  if (!featureEnabled(environment)) {
    return {
      feature_flag: 'AIOS_DAILY_CONTEXT_V1',
      enabled: false,
      mode: 'legacy_unchanged',
      written: []
    };
  }
  const context = collectFromRepository({ repositoryRoot, date, now });
  const catalogueDirectory = path.join(repositoryRoot, 'aios/modules/jeffrey/catalogues');
  const { history, references } = loadReminderHistory(catalogueDirectory);
  const historyRefs = references.map((filename) => publicPath(repositoryRoot, filename));
  const { catalogue, qaReport, executionReport } = generateDailyCatalogue({
    date,
    context,
    history,
    historyRefs
  });
  const contextFile = path.join(moduleDirectory, 'context', `${date}-daily-context.json`);
  const catalogueFile = path.join(moduleDirectory, 'catalogues', 'generated', `${date}-daily-style-catalogue.json`);
  const qaFile = path.join(moduleDirectory, 'qa', `${date}-qa-report.json`);
  const reportFile = path.join(moduleDirectory, 'reports', `${date}-execution-report.json`);
  const latestFile = path.join(moduleDirectory, 'latest.json');
  const latest = {
    schema_version: '1.0',
    date,
    status: 'draft_human_approval_required',
    feature_flag: 'AIOS_DAILY_CONTEXT_V1',
    context_status: catalogue.context_status,
    generated_at: now.toISOString(),
    daily_context_url: publicPath(repositoryRoot, contextFile),
    daily_catalogue_url: publicPath(repositoryRoot, catalogueFile),
    qa_report_url: publicPath(repositoryRoot, qaFile),
    execution_report_url: publicPath(repositoryRoot, reportFile)
  };
  const outputs = [
    { filename: contextFile, value: context, appendOnly: true },
    { filename: catalogueFile, value: catalogue, appendOnly: true },
    { filename: qaFile, value: qaReport, appendOnly: true },
    { filename: reportFile, value: executionReport, appendOnly: true },
    { filename: latestFile, value: latest, appendOnly: false }
  ];
  const writeResult = write ? writeAppendOnlyJson(outputs) : { written: [], reused: [] };
  return {
    feature_flag: 'AIOS_DAILY_CONTEXT_V1',
    enabled: true,
    mode: 'daily_context_v1',
    context,
    catalogue,
    qaReport,
    executionReport,
    latest,
    ...writeResult
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const date = argumentValue(process.argv, '--date') || hkDate();
  const result = runDaily({ date });
  console.log(JSON.stringify({
    enabled: result.enabled,
    mode: result.mode,
    date,
    context_status: result.catalogue?.context_status || null,
    written: result.written,
    reused: result.reused
  }, null, 2));
}
