#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DELIMITERS = { comma: ',', semicolon: ';', tab: '\t', pipe: '|' };
const MAX_BYTES = 10 * 1024 * 1024;

export function parseCsv(input, delimiter = ',') {
  if (typeof input !== 'string' || typeof delimiter !== 'string' || delimiter.length !== 1 || '\r\n"'.includes(delimiter)) {
    throw new TypeError('Expected CSV text and a single valid delimiter');
  }
  const text = input.replace(/^\uFEFF/, '');
  const records = [];
  const errors = [];
  let fields = [], field = '', state = 'start', line = 1, recordLine = 1;
  let active = false;
  function finishField() { fields.push(field); field = ''; }
  function finishRecord() {
    finishField();
    records.push({ line: recordLine, fields });
    fields = []; active = false; state = 'start';
  }
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const newline = c === '\r' || c === '\n';
    if (state === 'quoted') {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else state = 'afterQuote';
      } else if (newline) {
        field += '\n';
        if (c === '\r' && text[i + 1] === '\n') i++;
        line++;
      } else field += c;
      continue;
    }
    if (newline) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      finishRecord(); line++; recordLine = line;
    } else if (state === 'start') {
      active = true;
      if (c === delimiter) finishField();
      else if (c === '"') state = 'quoted';
      else { field += c; state = 'unquoted'; }
    } else if (state === 'unquoted') {
      if (c === delimiter) { finishField(); state = 'start'; }
      else if (c === '"') {
        errors.push({ code: 'UNEXPECTED_QUOTE', line, column: fields.length + 1 });
        field += c;
      } else field += c;
    } else if (state === 'afterQuote') {
      if (c === delimiter) { finishField(); state = 'start'; }
      else {
        errors.push({ code: 'TRAILING_CHAR_AFTER_QUOTE', line, column: fields.length + 1 });
        field += c; state = 'unquoted';
      }
    }
  }
  if (state === 'quoted') errors.push({ code: 'UNCLOSED_QUOTE', line: recordLine, column: fields.length + 1 });
  if (active || fields.length || field.length || state !== 'start') finishRecord();
  return { records, errors };
}

export function detectDelimiter(input) {
  const text = input.replace(/^\uFEFF/, '');
  let best = ',', bestCount = 1;
  for (const delimiter of Object.values(DELIMITERS)) {
    const parsed = parseCsv(text, delimiter);
    const first = parsed.records.find(r => r.fields.some(v => v.trim() !== ''));
    const count = first?.fields.length ?? 1;
    if (count > bestCount) { best = delimiter; bestCount = count; }
  }
  return best;
}

export function auditCsv(input, { delimiter = 'auto', header = true, formulaRisk = false } = {}) {
  if (typeof input !== 'string') throw new TypeError('CSV content must be text');
  const chosen = delimiter === 'auto' ? detectDelimiter(input) : (DELIMITERS[delimiter] ?? delimiter);
  const { records, errors } = parseCsv(input, chosen);
  const issues = [...errors];
  const nonblank = records.filter(record => {
    if (record.fields.length === 1 && record.fields[0].trim() === '') {
      issues.push({ code: 'BLANK_ROW', line: record.line });
      return false;
    }
    return true;
  });
  const first = nonblank[0];
  if (!first) issues.push({ code: 'EMPTY_CSV', line: 1 });
  const columns = first?.fields.length ?? 0;
  if (first && header) {
    const seen = new Set();
    for (const [i, value] of first.fields.entries()) {
      const normalized = value.trim().toLowerCase();
      if (!normalized) issues.push({ code: 'EMPTY_HEADER', line: first.line, column: i + 1 });
      else if (seen.has(normalized)) issues.push({ code: 'DUPLICATE_HEADER', line: first.line, column: i + 1 });
      else seen.add(normalized);
    }
  }
  for (const row of nonblank.slice(header ? 1 : 0)) {
    if (row.fields.length !== columns) {
      issues.push({ code: 'COLUMN_COUNT', line: row.line, expected: columns, actual: row.fields.length });
    }
    if (formulaRisk) for (const [i, value] of row.fields.entries()) {
      if (/^[\s\u0000-\u001f]*[=+@\-]/.test(value)) issues.push({ code: 'POTENTIAL_FORMULA', line: row.line, column: i + 1 });
    }
  }
  issues.sort((a, b) => a.line - b.line || (a.column ?? 0) - (b.column ?? 0));
  return { ok: issues.length === 0, delimiter: Object.entries(DELIMITERS).find(([,v]) => v === chosen)?.[0] ?? chosen,
    columns, dataRows: Math.max(0, nonblank.length - (header && first ? 1 : 0)), issues };
}

export function runCli(args = process.argv.slice(2)) {
  const usage = 'Usage: csv-guard --file data.csv [--delimiter auto|comma|semicolon|tab|pipe] [--no-header] [--formula-risk] [--json]';
  let file, delimiter = 'auto', header = true, formulaRisk = false, json = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { console.log(usage); return 0; }
    if (arg === '--file') file = args[++i];
    else if (arg === '--delimiter') delimiter = args[++i];
    else if (arg === '--no-header') header = false;
    else if (arg === '--formula-risk') formulaRisk = true;
    else if (arg === '--json') json = true;
    else { console.error(`Unknown option: ${arg}\n${usage}`); return 2; }
  }
  if (!file || !['auto', ...Object.keys(DELIMITERS)].includes(delimiter)) {
    console.error(usage); return 2;
  }
  try {
    const bytes = readFileSync(file);
    if (bytes.length > MAX_BYTES) throw new Error('CSV exceeds 10 MiB limit');
    const csv = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const result = auditCsv(csv, { delimiter, header, formulaRisk });
    if (json) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`CSV Guard: ${result.ok ? 'PASS' : 'FAIL'} | ${result.dataRows} data rows | ${result.columns} columns | delimiter: ${result.delimiter}`);
      for (const issue of result.issues) console.log(`Line ${issue.line}${issue.column ? `, column ${issue.column}` : ''}: ${issue.code}${issue.expected !== undefined ? ` (expected ${issue.expected}, got ${issue.actual})` : ''}`);
    }
    return result.ok ? 0 : 1;
  } catch (error) {
    // Avoid echoing file contents or absolute file paths in errors.
    console.error(error?.code === 'ENOENT' ? 'File not found or inaccessible' : error?.message === 'CSV exceeds 10 MiB limit' ? error.message : 'Unable to read or decode CSV file');
    return 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = runCli();
