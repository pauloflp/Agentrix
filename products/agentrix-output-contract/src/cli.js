#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { inspectSchema, validate } from './contract.js';

const MAX_BYTES = 1024 * 1024;
const HELP = `Agentrix Output Contract (Node 20+)
Usage: node src/cli.js --schema contract.json --input result.json [--format text|json]
Exit codes: 0 valid; 1 contract violation; 2 invalid schema/input/options.
Only a strict JSON Schema subset is supported: type, properties, required,
additionalProperties, items, enum. No raw input values are printed.`;

function parseArgs(args) {
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) return { help: true };
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--schema', '--input', '--format'].includes(key) || !args[i + 1] || args[i + 1].startsWith('--') || opts[key]) throw new Error('invalid_options');
    opts[key] = args[i + 1];
  }
  if (!opts['--schema'] || !opts['--input'] || (opts['--format'] && !['text', 'json'].includes(opts['--format']))) throw new Error('invalid_options');
  return { schema: opts['--schema'], input: opts['--input'], format: opts['--format'] || 'text' };
}

async function readJson(path) {
  // stat+readFile is adequate for local, trusted paths; reject large data before parsing.
  const { stat } = await import('node:fs/promises');
  const info = await stat(path);
  if (!info.isFile() || info.size > MAX_BYTES) throw new Error('file_unreadable_or_too_large');
  const data = await readFile(path, 'utf8');
  if (Buffer.byteLength(data) > MAX_BYTES) throw new Error('file_unreadable_or_too_large');
  return JSON.parse(data);
}

export async function run(args, io = { out: s => process.stdout.write(s), err: s => process.stderr.write(s) }) {
  let opts;
  try { opts = parseArgs(args); }
  catch { io.err('ERROR invalid_options\n' + HELP + '\n'); return 2; }
  if (opts.help) { io.out(HELP + '\n'); return 0; }
  let schema;
  try { schema = await readJson(opts.schema); }
  catch { io.err('ERROR invalid_or_unreadable_schema\n'); return 2; }
  const schemaIssues = inspectSchema(schema);
  if (schemaIssues.length) {
    if (opts.format === 'json') io.out(JSON.stringify({ valid: false, kind: 'invalid_schema', errors: schemaIssues }) + '\n');
    else for (const e of schemaIssues) io.err(`SCHEMA ${e.path}: ${e.code}\n`);
    return 2;
  }
  let input;
  try { input = await readJson(opts.input); }
  catch { io.err('ERROR invalid_or_unreadable_input\n'); return 2; }
  const errors = validate(input, schema);
  const valid = errors.length === 0;
  if (opts.format === 'json') io.out(JSON.stringify({ valid, kind: valid ? 'valid' : 'contract_violation', errors }) + '\n');
  else if (valid) io.out('VALID\n');
  else for (const e of errors) io.err(`VIOLATION ${e.path}: ${e.code}\n`);
  return valid ? 0 : 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const code = await run(process.argv.slice(2));
  process.exitCode = code;
}
