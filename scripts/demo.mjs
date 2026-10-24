#!/usr/bin/env node
// Run the real CLIs against bundled synthetic examples. No installs or network.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const demos = {
  'jsonl-guard': [
    ['Valid JSONL', 0, ['bin/jsonl-guard.mjs', '--file', 'examples/valid.jsonl']],
    ['Malformed JSON on line 2', 1, ['bin/jsonl-guard.mjs', '--file', 'examples/invalid.jsonl']],
    ['Valid NDJSON values', 0, ['bin/jsonl-guard.mjs', '--file', 'examples/values.ndjson']],
    ['Require objects in NDJSON', 1, ['bin/jsonl-guard.mjs', '--file', 'examples/values.ndjson', '--objects-only']],
  ],
  'env-contract': [
    ['Matching key names', 0, ['bin/env-contract.mjs', '--example', 'examples/expected.env', '--env', 'examples/matching.env']],
    ['Missing and undocumented keys', 1, ['bin/env-contract.mjs', '--example', 'examples/expected.env', '--env', 'examples/drift.env']],
  ],
  'csv-guard': [
    ['Consistent CSV', 0, ['bin/csv-guard.mjs', '--file', 'examples/valid.csv']],
    ['Missing column and formula-like cell', 1, ['bin/csv-guard.mjs', '--file', 'examples/invalid.csv', '--formula-risk']],
  ],
  'utm-audit': [
    ['Consistent campaign tags', 0, ['bin/utm-audit.mjs', '--file', 'examples/valid-urls.txt']],
    ['Missing medium and uppercase source', 1, ['bin/utm-audit.mjs', '--file', 'examples/invalid-urls.txt']],
  ],
  'json-diff': [
    ['Equal JSON documents', 0, ['json-diff.mjs', 'examples/before.json', 'examples/before.json']],
    ['Changed, removed and added keys', 1, ['json-diff.mjs', 'examples/before.json', 'examples/after.json']],
  ],
};

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--help') {
  console.log(`Usage: node scripts/demo.mjs [${Object.keys(demos).join('|')}]\nOmit the tool name to run all demos. Inputs are synthetic; expected rejections exit 1 in the child CLI.`);
} else if (args.length > 1 || (args.length && !Object.hasOwn(demos, args[0]))) {
  console.error('Unknown demo. Run node scripts/demo.mjs --help for available tools.');
  process.exitCode = 2;
} else {
  let failures = 0, count = 0;
  for (const tool of args.length ? args : Object.keys(demos)) {
    const cwd = fileURLToPath(new URL(`../products/agentrix-${tool}/`, import.meta.url));
    console.log(`\n=== Agentrix ${tool} ===`);
    for (const [label, expected, cliArgs] of demos[tool]) {
      count++;
      console.log(`\n${label}\n$ node ${cliArgs.join(' ')}`);
      const result = spawnSync(process.execPath, cliArgs, { cwd, encoding: 'utf8', timeout: 10000 });
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
      if (result.error || result.status !== expected) {
        failures++;
        console.error(`Unexpected result: expected exit ${expected}, got ${result.status}${result.error ? ` (${result.error.message})` : ''}`);
      } else console.log(`Expected exit ${expected}.`);
    }
  }
  console.log(`\n${count - failures}/${count} examples returned their expected exit codes.`);
  process.exitCode = failures ? 1 : 0;
}
