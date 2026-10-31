import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectText, inspectFile, InputError, LIMITS } from '../src/inspector.js';

const ts = '2026-10-20T12:00:00Z';
const row = (event_id, endpoint_id, attempt, status_code, timestamp = ts) => ({ event_id, endpoint_id, attempt, timestamp, status_code });
const lines = (...items) => items.map((x) => JSON.stringify(x)).join('\n') + '\n';
const codes = (r) => r.alerts.map((a) => a.code);
const cli = (...args) => spawnSync(process.execPath, ['src/cli.js', ...args], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });

test('single successful delivery is clean', () => {
  const result = inspectText(lines(row('one', 'ep', 1, 200)));
  assert.equal(result.summary.alert_count, 0);
  assert.equal(result.summary.unique_attempts, 1);
});

test('success after failed retry is not multiple success', () => {
  const result = inspectText(lines(row('one', 'ep', 1, 500), row('one', 'ep', 2, 200)));
  assert.deepEqual(codes(result), []);
  assert.equal(result.endpoints[0].error_rate_percent, 50);
});

test('two distinct successes are flagged', () => {
  assert.deepEqual(codes(inspectText(lines(row('one', 'ep', 1, 200), row('one', 'ep', 2, 201)))), ['MULTIPLE_SUCCESSES']);
});

test('no observed success is flagged', () => {
  const result = inspectText(lines(row('one', 'ep', 1, 500), row('one', 'ep', 2, 503)));
  assert.ok(codes(result).includes('NO_SUCCESS'));
  assert.ok(codes(result).includes('HIGH_ERROR_RATE'));
});

test('excessive attempts use distinct attempt count', () => {
  const result = inspectText(lines(row('one', 'ep', 1, 500), row('one', 'ep', 2, 500), row('one', 'ep', 3, 500), row('one', 'ep', 4, 200)));
  assert.ok(codes(result).includes('EXCESSIVE_ATTEMPTS'));
  assert.ok(!codes(result).includes('NO_SUCCESS'));
});

test('identical duplicate log rows do not count as two deliveries', () => {
  const result = inspectText(lines(row('one', 'ep', 1, 200), row('one', 'ep', 1, 200)));
  assert.equal(result.summary.duplicate_log_rows, 1);
  assert.equal(result.summary.unique_attempts, 1);
  assert.equal(result.summary.alert_count, 0);
});

test('conflicting records for same attempt are flagged', () => {
  const result = inspectText(lines(row('one', 'ep', 1, 200), row('one', 'ep', 1, 500)));
  assert.deepEqual(codes(result), ['ATTEMPT_CONFLICT']);
  assert.deepEqual(result.alerts[0].attempt_numbers, [1]);
});

test('same event ID across endpoints does not merge groups', () => {
  const result = inspectText(lines(row('one', 'epA', 1, 200), row('one', 'epB', 1, 200)));
  assert.equal(result.summary.event_endpoint_groups, 2);
  assert.equal(result.summary.alert_count, 0);
});

test('different event IDs on same endpoint do not conflict', () => {
  const result = inspectText(lines(row('one', 'ep', 1, 200), row('two', 'ep', 1, 200)));
  assert.equal(result.summary.event_endpoint_groups, 2);
  assert.equal(result.summary.alert_count, 0);
});

test('error rate is computed on unique attempts and strict threshold', () => {
  const result = inspectText(lines(row('one', 'ep', 1, 500), row('one', 'ep', 1, 500), row('one', 'ep', 2, 200)), { errorRateThreshold: 50 });
  assert.equal(result.endpoints[0].error_rate_percent, 50);
  assert.ok(!codes(result).includes('HIGH_ERROR_RATE'));
  assert.ok(codes(inspectText(lines(row('one', 'ep', 1, 500), row('one', 'ep', 2, 200)), { errorRateThreshold: 49 })).includes('HIGH_ERROR_RATE'));
});

test('input order does not affect report ordering', () => {
  const rows = [row('b', 'z', 1, 503), row('a', 'a', 1, 200), row('c', 'z', 1, 200)];
  assert.deepEqual(inspectText(lines(...rows)), inspectText(lines(...rows.reverse())));
});

test('invalid JSONL rejected with safe line number', () => {
  assert.throws(() => inspectText(lines(row('a', 'ep', 1, 200)) + '{bad\n'), (e) => e instanceof InputError && e.line === 2 && !e.message.includes('{bad'));
});

test('invalid timestamps including normalized dates rejected', () => {
  for (const bad of ['2026-02-30T12:00:00Z', '2026-10-20T25:00:00Z', '2026-10-20T12:00:00', '2026-10-20T12:00:00+25:00', '2026-10-20T12:00:00.1234Z']) {
    assert.throws(() => inspectText(lines(row('a', 'ep', 1, 200, bad))), InputError);
  }
});

test('invalid IDs, status codes and attempts rejected', () => {
  const badRows = [row('', 'ep', 1, 200), row('a', 'ep', 0, 200), row('a', 'ep', 1.5, 200), row('a', 'ep', 1, 600), row('a', 'ep', 1, '200'), row('a', 'ep with space', 1, 200)];
  for (const bad of badRows) assert.throws(() => inspectText(lines(bad)), InputError);
});

test('secret-like extra fields are rejected without printing values', () => {
  const sensitive = { ...row('secret-event', 'ep', 1, 200), token: 'SUPER_SECRET_123', payload: 'PAYLOAD_SECRET_456' };
  assert.throws(() => inspectText(lines(sensitive)), (e) => e instanceof InputError && !e.message.includes('SUPER_SECRET'));
  const dir = mkdtempSync(join(tmpdir(), 'lab011-'));
  try {
    const file = join(dir, 'sensitive.jsonl'); writeFileSync(file, lines(sensitive));
    const result = cli('--input', file);
    assert.equal(result.status, 2);
    assert.doesNotMatch(result.stdout + result.stderr, /SUPER_SECRET|PAYLOAD_SECRET|secret-event|sensitive\.jsonl/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('valid output hashes identifiers and never includes raw event IDs', () => {
  const result = JSON.stringify(inspectText(lines(row('RAW_SECRET_EVENT', 'RAW_SECRET_ENDPOINT', 1, 500))));
  assert.doesNotMatch(result, /RAW_SECRET/);
  assert.match(result, /event_ref/);
});

test('reject empty, BOM, blank line, and invalid options', () => {
  for (const s of ['', '\uFEFF' + lines(row('a', 'ep', 1, 200)), '\n' + lines(row('a', 'ep', 1, 200))]) assert.throws(() => inspectText(s), InputError);
  assert.throws(() => inspectText(lines(row('a', 'ep', 1, 200)), { maxAttempts: 0 }), InputError);
  assert.throws(() => inspectText(lines(row('a', 'ep', 1, 200)), { errorRateThreshold: 101 }), InputError);
});

test('size, line length, line count, and group caps enforced', () => {
  assert.throws(() => inspectText('x'.repeat(LIMITS.maxBytes + 1)), InputError);
  assert.throws(() => inspectText('x'.repeat(LIMITS.maxLineBytes + 1)), InputError);
  assert.throws(() => inspectText('\n'.repeat(LIMITS.maxLines + 1)), InputError);
  const many = Array.from({ length: LIMITS.maxGroups + 1 }, (_, i) => row(`evt-${i}`, 'ep', 1, 200));
  assert.throws(() => inspectText(lines(...many)), InputError);
});

test('CLI exit 0 for healthy, 1 for alert, 2 for invalid', () => {
  const good = cli('--input', 'fixtures/healthy.jsonl');
  assert.equal(good.status, 0, good.stderr);
  assert.equal(JSON.parse(good.stdout).summary.alert_count, 0);
  const alert = cli('--input', 'fixtures/mixed.jsonl');
  assert.equal(alert.status, 1, alert.stderr);
  assert.ok(JSON.parse(alert.stdout).summary.alert_count > 0);
  const invalid = cli('--input', 'fixtures/invalid.jsonl');
  assert.equal(invalid.status, 2);
  assert.match(invalid.stderr, /INPUT_ERROR line=1/);
});

test('CLI text mode and help are usable', () => {
  const text = cli('--input', 'fixtures/mixed.jsonl', '--format', 'text');
  assert.equal(text.status, 1);
  assert.match(text.stdout, /MULTIPLE_SUCCESSES/);
  const help = cli('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage:/);
});

test('CLI rejects missing file, unknown flag, and duplicate flag', () => {
  for (const args of [[], ['--input', '/missing/secret'], ['--bogus', 'x'], ['--input', 'fixtures/healthy.jsonl', '--input', 'fixtures/healthy.jsonl']]) {
    const r = cli(...args);
    assert.equal(r.status, 2);
    assert.doesNotMatch(r.stderr, /\/missing\/secret/);
  }
});

test('invalid UTF-8 file is rejected', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lab011-'));
  try {
    const file = join(dir, 'bad.jsonl');
    writeFileSync(file, Buffer.from([0xff, 0xfe]));
    assert.throws(() => inspectFile(file), InputError);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
