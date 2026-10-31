#!/usr/bin/env node
import { inspectFile, InputError } from './inspector.js';

function usage() {
  return 'Usage: node src/cli.js --input <deliveries.jsonl> [--format json|text] [--max-attempts 3] [--error-rate-threshold 50]\nExit 0 clean, 1 alerts, 2 invalid input/options. Offline; metadata-only input.\n';
}

function parseArgs(args) {
  if (args.includes('--help') || args.includes('-h')) return { help: true };
  const values = {};
  const allowed = new Set(['--input', '--format', '--max-attempts', '--error-rate-threshold']);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!allowed.has(key) || values[key] !== undefined || i + 1 >= args.length || args[i + 1].startsWith('--')) throw new InputError('Invalid or duplicate CLI argument');
    values[key] = args[i + 1];
  }
  if (!values['--input']) throw new InputError('--input is required');
  const format = values['--format'] ?? 'json';
  if (!['json', 'text'].includes(format)) throw new InputError('Unsupported output format');
  const maxAttempts = values['--max-attempts'] === undefined ? 3 : Number(values['--max-attempts']);
  const errorRateThreshold = values['--error-rate-threshold'] === undefined ? 50 : Number(values['--error-rate-threshold']);
  if (values['--max-attempts'] !== undefined && !/^\d+$/.test(values['--max-attempts'])) throw new InputError('Invalid max-attempts');
  if (values['--error-rate-threshold'] !== undefined && !/^\d+(?:\.\d+)?$/.test(values['--error-rate-threshold'])) throw new InputError('Invalid error-rate-threshold');
  return { input: values['--input'], format, maxAttempts, errorRateThreshold };
}

export function run(args, out = process.stdout, err = process.stderr) {
  try {
    const opts = parseArgs(args);
    if (opts.help) { out.write(usage()); return 0; }
    const report = inspectFile(opts.input, opts);
    if (opts.format === 'json') out.write(JSON.stringify(report, null, 2) + '\n');
    else {
      out.write(`Rows ${report.summary.input_rows}; unique attempts ${report.summary.unique_attempts}; alerts ${report.summary.alert_count}\n`);
      for (const alert of report.alerts) out.write(`${alert.code} endpoint=${alert.endpoint_ref}${alert.event_ref ? ` event=${alert.event_ref}` : ''}\n`);
    }
    return report.alerts.length ? 1 : 0;
  } catch (e) {
    if (e instanceof InputError) {
      err.write(`INPUT_ERROR${e.line ? ` line=${e.line}` : ''}: ${e.message}\n`);
      return 2;
    }
    err.write('UNEXPECTED_ERROR: inspection failed\n');
    return 2;
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exitCode = run(process.argv.slice(2));
