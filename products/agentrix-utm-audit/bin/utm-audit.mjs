#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const REQUIRED = ['utm_source', 'utm_medium', 'utm_campaign'];
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_LINES = 10000;
const KNOWN = new Set([...REQUIRED, 'utm_id', 'utm_term', 'utm_content', 'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic']);

export function auditUrls(urls, { allowUntagged = false } = {}) {
  const issues = [];
  const counts = { urls: 0, tagged: 0, untagged: 0 };
  const caseSeen = new Map();
  function issue(line, code, key, message) { issues.push({ line, code, key, message }); }
  urls.forEach((entry, idx) => {
    const line = idx + 1;
    const raw = entry.trim();
    if (!raw || raw.startsWith('#')) return;
    counts.urls++;
    let url;
    try { url = new URL(raw); }
    catch { issue(line, 'INVALID_URL', null, 'Not a valid absolute URL'); return; }
    if (!['http:', 'https:'].includes(url.protocol)) { issue(line, 'UNSUPPORTED_SCHEME', null, 'Only http and https links are supported'); return; }
    const entries = [...url.searchParams.entries()];
    const utms = entries.filter(([k]) => k.toLowerCase().startsWith('utm_'));
    if (url.hash && /(?:^|[?&#])utm_/i.test(url.hash)) issue(line, 'UTM_IN_FRAGMENT', null, 'UTM parameters appear after # and will not be sent as query parameters');
    if (!utms.length) {
      counts.untagged++;
      if (!allowUntagged) issue(line, 'UNTAGGED_URL', null, 'Campaign link has no UTM query parameters');
      return;
    }
    counts.tagged++;
    const seen = new Set();
    for (const [key, value] of utms) {
      const lowerKey = key.toLowerCase();
      if (seen.has(lowerKey)) issue(line, 'DUPLICATE_KEY', lowerKey, 'UTM key is repeated');
      seen.add(lowerKey);
      if (key !== lowerKey) issue(line, 'KEY_CASE', lowerKey, 'UTM parameter key should be lowercase');
      if (!KNOWN.has(lowerKey)) issue(line, 'UNKNOWN_UTM_KEY', lowerKey, 'Unrecognized UTM key; check for a typo');
      if (!value.trim()) issue(line, 'EMPTY_VALUE', lowerKey, 'UTM parameter value is empty');
      if (value !== value.toLowerCase()) issue(line, 'VALUE_CASE', lowerKey, 'Mixed/uppercase value can fragment case-sensitive reporting');
      if (value !== value.trim() || /\s/u.test(value)) issue(line, 'VALUE_SPACING', lowerKey, 'Whitespace in UTM value can fragment reporting');
      const canonical = value.toLowerCase();
      const previous = caseSeen.get(`${lowerKey}\u0000${canonical}`);
      if (previous && previous.value !== value) issue(line, 'CROSS_URL_CASE', lowerKey, `Value differs in capitalization from line ${previous.line}`);
      else if (!previous) caseSeen.set(`${lowerKey}\u0000${canonical}`, { value, line });
    }
    for (const key of REQUIRED) {
      if (!seen.has(key)) issue(line, 'MISSING_REQUIRED', key, 'Recommended core UTM parameter is missing');
    }
  });
  return { ok: issues.length === 0, ...counts, issues };
}

export function run(args, io = console) {
  if (args.includes('--help')) { io.log('Usage: node bin/utm-audit.mjs --file urls.txt [--json] [--allow-untagged]'); return 0; }
  const fileAt = args.indexOf('--file');
  if (fileAt < 0 || !args[fileAt + 1] || args[fileAt + 1].startsWith('--')) throw Error('A path after --file is required');
  const file = args[fileAt + 1];
  if (statSync(file).size > MAX_BYTES) throw Error('Input exceeds 2 MiB limit');
  const lines = readFileSync(file, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines.length > MAX_LINES) throw Error('Input exceeds 10,000 lines');
  const result = auditUrls(lines, { allowUntagged: args.includes('--allow-untagged') });
  if (args.includes('--json')) io.log(JSON.stringify(result, null, 2));
  else {
    io.log(`${result.ok ? 'PASS' : 'FAIL'}: ${result.urls} URLs, ${result.tagged} tagged, ${result.untagged} untagged, ${result.issues.length} issues`);
    for (const x of result.issues) io.log(`line ${x.line}: ${x.code}${x.key ? ` (${x.key})` : ''}: ${x.message}`);
  }
  return result.ok ? 0 : 1;
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try { process.exitCode = run(process.argv.slice(2)); }
  catch (e) { console.error(`ERROR: ${e.message}`); process.exitCode = 2; }
}
