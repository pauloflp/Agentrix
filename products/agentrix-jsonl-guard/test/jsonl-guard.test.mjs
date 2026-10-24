import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateJSONL, parseArgs, MAX_ISSUES, MAX_BYTES } from '../bin/jsonl-guard.mjs';

const cli = fileURLToPath(new URL('../bin/jsonl-guard.mjs', import.meta.url));
const secret = 'PRIVATE_VALUE_SHOULD_NEVER_APPEAR_726491';
function check(content, options = [], encoding = 'utf8') {
  const dir = mkdtempSync(join(tmpdir(), 'agentrix-jsonl-'));
  const file = join(dir, 'input.ndjson');
  try {
    writeFileSync(file, content, encoding);
    return spawnSync(process.execPath, [cli, '--file', file, ...options], { encoding: 'utf8' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('valid objects pass and no values appear', () => {
  const r = check(`{"token":"${secret}"}\n{"id":2}\n`);
  assert.equal(r.status, 0); assert.match(r.stdout, /^PASS: 2 lines, 2 valid, 0 invalid/);
  assert.doesNotMatch(r.stdout + r.stderr, /PRIVATE_VALUE/);
});
test('invalid line returns line number without content or parser exception', () => {
  const r = check(`{"token":"${secret}"}\n{"token":"${secret}",}\n`);
  assert.equal(r.status, 1); assert.match(r.stdout, /line 2: INVALID_JSON/);
  assert.doesNotMatch(r.stdout + r.stderr, /PRIVATE_VALUE|Unexpected token|position /);
});
test('JSON output exposes only structured counts and error codes', () => {
  const r = check(`{"a":"${secret}"}\ninvalid ${secret}\n`, ['--json']);
  assert.equal(r.status, 1);
  assert.deepEqual(JSON.parse(r.stdout), {ok:false, lines:2, valid:1, invalid:1, issues:[{line:2,code:'INVALID_JSON'}],omittedIssues:0});
  assert.doesNotMatch(r.stdout, /PRIVATE_VALUE/);
});
test('empty file fails with EMPTY_FILE', () => {
  const r = check(''); assert.equal(r.status, 1); assert.match(r.stdout, /line 0: EMPTY_FILE/);
});
test('a blank line inside JSONL is invalid', () => {
  const r = check('{"a":1}\n\n{"b":2}\n');
  assert.equal(r.status, 1); assert.match(r.stdout, /line 2: EMPTY_LINE/);
});
test('a trailing newline is not a blank record', () => {
  const r = check('{"a":1}\n'); assert.equal(r.status, 0);
});
test('accepts CRLF line endings', () => {
  const r = check('{"a":1}\r\n{"b":2}\r\n'); assert.equal(r.status, 0);
});
test('accepts UTF-8 BOM', () => {
  const r = check('\uFEFF{"a":1}\n'); assert.equal(r.status, 0);
});
test('rejects invalid UTF-8 without displaying raw bytes', () => {
  const r = check(Buffer.from([0xff,0xfe,0x7b,0x7d]));
  assert.equal(r.status, 2); assert.match(r.stderr, /not valid UTF-8/);
});
test('accepts any valid JSON literal in default mode', () => {
  const r = check('null\ntrue\n123\n"hi"\n[1,2]\n{"ok":1}\n');
  assert.equal(r.status, 0); assert.match(r.stdout, /6 valid/);
});
test('objects-only mode rejects arrays, null, and scalar JSON', () => {
  const r = check('[1]\nnull\n0\n{"ok":true}\n', ['--objects-only','--json']);
  assert.equal(r.status, 1);
  assert.deepEqual(JSON.parse(r.stdout).issues.map(x=>x.code), ['NOT_OBJECT','NOT_OBJECT','NOT_OBJECT']);
  assert.equal(JSON.parse(r.stdout).valid, 1);
});
test('issue limit truncates report without losing total count', () => {
  const r = check('bad\nbad\nbad\n', ['--json','--max-issues','1']);
  assert.equal(r.status, 1); const x = JSON.parse(r.stdout);
  assert.equal(x.invalid,3); assert.equal(x.issues.length,1); assert.equal(x.omittedIssues,2);
});
test('rejects unknown CLI flag', () => {
  const r = check('{"ok":true}\n', ['--jso']); assert.equal(r.status,2);
  assert.match(r.stderr,/Unknown argument/);
});
test('rejects repeated options', () => {
  const r = check('[]\n',['--json','--json']); assert.equal(r.status,2);
});
test('rejects invalid --max-issues', () => {
  for(const n of ['0','101','-2','abc','1.5']) assert.equal(check('{}\n',['--max-issues',n]).status,2);
});
test('rejects missing file and missing required values', () => {
  assert.equal(spawnSync(process.execPath,[cli],{encoding:'utf8'}).status,2);
  assert.equal(spawnSync(process.execPath,[cli,'--file'],{encoding:'utf8'}).status,2);
});
test('does not reveal sensitive missing file paths in errors', () => {
  const r=spawnSync(process.execPath,[cli,'--file','/missing/'+secret+'.jsonl'],{encoding:'utf8'});
  assert.equal(r.status,2); assert.doesNotMatch(r.stderr, /PRIVATE_VALUE/);
});
test('rejects oversized files', () => {
  const r=check(Buffer.alloc(MAX_BYTES+1,0x61)); assert.equal(r.status,2);
  assert.match(r.stderr,/20 MiB/);
});
test('refuses directories as input', () => {
  const dir=mkdtempSync(join(tmpdir(),'agentrix-jsonl-'));
  try {const r=spawnSync(process.execPath,[cli,'--file',dir],{encoding:'utf8'});
    assert.equal(r.status,2); assert.match(r.stderr,/regular file/);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('help is available without reading a file', () => {
  const r=spawnSync(process.execPath,[cli,'--help'],{encoding:'utf8'});
  assert.equal(r.status,0); assert.match(r.stdout,/Agentrix JSONL Guard/);
});
test('help cannot be combined with flags', () => {
  assert.equal(spawnSync(process.execPath,[cli,'--help','--json'],{encoding:'utf8'}).status,2);
});
test('parser enforces issue limits and non-string input types', () => {
  assert.throws(()=>validateJSONL('',{maxIssues:MAX_ISSUES+1}),RangeError);
  assert.throws(()=>validateJSONL(null),TypeError);
});
test('leading blank line is reported, not silently skipped',()=>{
  assert.deepEqual(validateJSONL('\n{}\n').issues,[{line:1,code:'EMPTY_LINE'}]);
});
test('parseArgs respects all documented switches',()=>{
  assert.deepEqual(parseArgs(['--json','--file','abc.jsonl','--objects-only','--max-issues','2']),
    {file:'abc.jsonl',json:true,objectsOnly:true,maxIssues:2,help:false});
});
