import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { auditCsv, parseCsv, detectDelimiter } from '../bin/csv-guard.mjs';

const codes = r => r.issues.map(x => x.code);
function cli(data, args = []) {
  const dir = mkdtempSync(join(tmpdir(), 'agentrix-csv-'));
  try {
    const file = join(dir, 'data.csv');
    writeFileSync(file, data);
    return spawnSync(process.execPath, [fileURLToPath(new URL('../bin/csv-guard.mjs', import.meta.url)), '--file', file, ...args], { encoding: 'utf8' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
test('valid CSV passes', () => assert.equal(auditCsv('name,age\nAlice,30\nBob,31\n').ok, true));
test('column mismatch is reported with line', () => { const r = auditCsv('a,b\n1\n'); assert.equal(r.issues[0].code, 'COLUMN_COUNT'); assert.equal(r.issues[0].line, 2); });
test('duplicate headers are case insensitive', () => assert.ok(codes(auditCsv('Name, name\nx,y')).includes('DUPLICATE_HEADER')));
test('empty header is rejected', () => assert.ok(codes(auditCsv('a,\n1,2')).includes('EMPTY_HEADER')));
test('empty CSV is rejected', () => assert.ok(codes(auditCsv('')).includes('EMPTY_CSV')));
test('blank row is reported', () => assert.ok(codes(auditCsv('a,b\n\n1,2')).includes('BLANK_ROW')));
test('BOM is supported', () => assert.equal(auditCsv('\uFEFFa,b\n1,2').ok, true));
test('CRLF is supported', () => assert.equal(auditCsv('a,b\r\n1,2\r\n').ok, true));
test('quoted comma is parsed', () => assert.deepEqual(parseCsv('a,b\n"x,y",z').records[1].fields, ['x,y', 'z']));
test('escaped double quotes are parsed', () => assert.deepEqual(parseCsv('a\n"hello ""world"""').records[1].fields, ['hello "world"']));
test('multiline quoted field retains logical row', () => { const r = auditCsv('a,b\n"hello\nworld",z'); assert.equal(r.ok, true); assert.equal(r.dataRows, 1); });
test('unclosed quote is rejected', () => assert.ok(codes(auditCsv('a,b\n"hello,z')).includes('UNCLOSED_QUOTE')));
test('unexpected quote is rejected', () => assert.ok(codes(auditCsv('a\nfoo"bar')).includes('UNEXPECTED_QUOTE')));
test('characters after closing quote rejected', () => assert.ok(codes(auditCsv('a\n"foo"bar')).includes('TRAILING_CHAR_AFTER_QUOTE')));
test('semicolon autodetection', () => { assert.equal(detectDelimiter('a;b;c\n1;2;3'), ';'); assert.equal(auditCsv('a;b;c\n1;2;3').ok, true); });
test('tab autodetection', () => assert.equal(auditCsv('a\tb\n1\t2').delimiter, 'tab'));
test('pipe delimiter is supported', () => assert.equal(auditCsv('a|b\n1|2', { delimiter: 'pipe' }).ok, true));
test('headerless mode works', () => assert.equal(auditCsv('1,2\n3,4', { header: false }).dataRows, 2));
test('formula check opt-in', () => { assert.equal(auditCsv('a\n=SUM(1)').ok, true); assert.ok(codes(auditCsv('a\n=SUM(1)', { formulaRisk: true })).includes('POTENTIAL_FORMULA')); });
test('JSON output contains no cell values', () => { const r = cli('token\nprivate-secret\n', ['--json']); assert.equal(r.status, 0); assert.doesNotMatch(r.stdout, /private-secret/); });
test('CLI nonzero exit on invalid CSV', () => assert.equal(cli('a,b\n1').status, 1));
test('CLI help exits successfully', () => assert.equal(spawnSync(process.execPath, [fileURLToPath(new URL('../bin/csv-guard.mjs', import.meta.url)), '--help']).status, 0));
test('invalid UTF-8 is rejected without contents', () => { const r = cli(Buffer.from([0xff, 0xfe])); assert.equal(r.status, 2); });
test('invalid CLI delimiter exits 2', () => assert.equal(cli('a,b\n1,2', ['--delimiter', 'bad']).status, 2));
test('no extra row for trailing newline', () => assert.equal(auditCsv('a\nx\n').dataRows, 1));
