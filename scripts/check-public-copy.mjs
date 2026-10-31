#!/usr/bin/env node
// Keep public product documentation focused on what people can actually use.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const patterns = [
  ['private lab ticket', /\bLAB-\d{2,}\b/i],
  ['agent execution ID', /\b(?:DYN|ORQ)-20\d{6}[A-Z0-9_-]*\b/i],
  ['execution run ID', /\b(?:run[_ ]id|auto_pull|sync_pending_notion)\b/i],
  ['internal operations', /\b(?:Notion (?:queue|logs?|database|workspace)|private operational (?:notes?|context)|internal (?:checkpoints?|handoff|execution logs?))\b/i],
  ['internal review instruction', /\b(?:owner|user) (?:instructed|asked|authorized|decided)\b/i],
];

const isPublicProse = (path) => /\.md$/i.test(path) && !path.startsWith('skills/');
const files = execFileSync('git', ['ls-files', '--', '*.md'], { encoding: 'utf8' }).trim().split('\n').filter(isPublicProse);
const findings = [];

function scan(label, content) {
  content.split(/\r?\n/).forEach((line, index) => {
    for (const [description, pattern] of patterns) {
      if (pattern.test(line)) findings.push(`${label}:${index + 1}: ${description}`);
    }
  });
}

for (const file of files) scan(file, readFileSync(file, 'utf8'));

if (process.env.GITHUB_EVENT_PATH) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  if (event.pull_request) scan('pull request description', `${event.pull_request.title || ''}\n${event.pull_request.body || ''}`);
}

if (findings.length) {
  console.error('Public-facing copy contains possible internal operations wording:');
  for (const f of findings) console.error('  ' + f);
  console.error('Rewrite this as a user-facing explanation, or review a false positive before merging.');
  process.exitCode = 1;
} else console.log(`Public copy check passed (${files.length} Markdown files).`);
