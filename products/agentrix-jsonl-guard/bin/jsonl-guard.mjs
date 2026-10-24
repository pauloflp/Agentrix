#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const MAX_BYTES = 20 * 1024 * 1024;
export const MAX_ISSUES = 100;
const DEFAULT_ISSUES = 20;

export function parseArgs(args) {
  const options = { file: null, json: false, objectsOnly: false, maxIssues: DEFAULT_ISSUES, help: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!['--file', '--json', '--objects-only', '--max-issues', '--help'].includes(arg)) {
      throw Error('Unknown argument. Run with --help for supported options.');
    }
    if (seen.has(arg)) throw Error('An option was provided more than once.');
    seen.add(arg);
    if (arg === '--help') options.help = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--objects-only') options.objectsOnly = true;
    else {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw Error('An option is missing its required value.');
      if (arg === '--file') options.file = value;
      else {
        if (!/^[1-9]\d*$/.test(value) || Number(value) > MAX_ISSUES) {
          throw Error(`--max-issues must be an integer from 1 to ${MAX_ISSUES}.`);
        }
        options.maxIssues = Number(value);
      }
    }
  }
  if (options.help) {
    if (args.length > 1) throw Error('--help cannot be combined with other options.');
    return options;
  }
  if (!options.file) throw Error('--file is required.');
  return options;
}

/** Validates one JSON value per line; never returns the original records or parser exception messages. */
export function validateJSONL(input, { objectsOnly = false, maxIssues = DEFAULT_ISSUES } = {}) {
  if (typeof input !== 'string') throw new TypeError('Expected UTF-8 text.');
  if (!Number.isInteger(maxIssues) || maxIssues < 1 || maxIssues > MAX_ISSUES) {
    throw new RangeError('Invalid issue reporting limit.');
  }
  const clean = input.charCodeAt(0) === 0xFEFF ? input.slice(1) : input;
  const rows = clean.split('\n');
  if (rows.at(-1) === '' && clean.endsWith('\n')) rows.pop();
  const issues = [];
  let valid = 0, invalid = 0;
  function issue(line, code) {
    invalid++;
    if (issues.length < maxIssues) issues.push({ line, code });
  }
  if (clean.length === 0) issue(0, 'EMPTY_FILE');
  else {
    for (let i = 0; i < rows.length; i++) {
      const line = rows[i].endsWith('\r') ? rows[i].slice(0, -1) : rows[i];
      if (line.trim().length === 0) { issue(i + 1, 'EMPTY_LINE'); continue; }
      let value;
      try { value = JSON.parse(line); }
      catch { issue(i + 1, 'INVALID_JSON'); continue; }
      if (objectsOnly && (value === null || typeof value !== 'object' || Array.isArray(value))) {
        issue(i + 1, 'NOT_OBJECT');
      } else valid++;
    }
  }
  return {
    ok: invalid === 0,
    lines: clean.length === 0 ? 0 : rows.length,
    valid,
    invalid,
    issues,
    omittedIssues: Math.max(0, invalid - issues.length),
  };
}

const USAGE = `Agentrix JSONL Guard | Offline JSON Lines validator
Usage: node bin/jsonl-guard.mjs --file records.jsonl [--json] [--objects-only] [--max-issues N]
  --file PATH       Input file, UTF-8 JSONL / NDJSON (up to 20 MiB)
  --json            Machine-readable summary (never includes original values)
  --objects-only    Require every line to contain a JSON object
  --max-issues N    Report up to N line errors (1-100; default 20)
  --help            Show this help
Exit codes: 0 valid, 1 invalid JSONL, 2 usage / file / encoding error.`;

export function run(args, io = console) {
  const opt = parseArgs(args);
  if (opt.help) { io.log(USAGE); return 0; }
  let bytes;
  try {
    const info = statSync(opt.file);
    if (!info.isFile()) throw Error('Input is not a regular file.');
    if (info.size > MAX_BYTES) throw Error('Input exceeds 20 MiB.');
    bytes = readFileSync(opt.file);
  } catch (e) {
    if (e?.message === 'Input exceeds 20 MiB.' || e?.message === 'Input is not a regular file.') throw e;
    throw Error('Input file cannot be read.');
  }
  if (bytes.length > MAX_BYTES) throw Error('Input exceeds 20 MiB.');
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw Error('Input is not valid UTF-8.'); }
  const result = validateJSONL(text, { objectsOnly: opt.objectsOnly, maxIssues: opt.maxIssues });
  if (opt.json) io.log(JSON.stringify(result, null, 2));
  else {
    io.log(`${result.ok ? 'PASS' : 'FAIL'}: ${result.lines} lines, ${result.valid} valid, ${result.invalid} invalid`);
    for (const { line, code } of result.issues) io.log(`line ${line}: ${code}`);
    if (result.omittedIssues) io.log(`${result.omittedIssues} additional issues omitted`);
  }
  return result.ok ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try { process.exitCode = run(process.argv.slice(2)); }
  catch (e) { console.error(`ERROR: ${e.message}`); process.exitCode = 2; }
}
