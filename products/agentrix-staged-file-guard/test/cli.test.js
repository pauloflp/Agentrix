import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { classifyPath } from '../src/cli.js';

const CLI = resolve(fileURLToPath(new URL('../src/cli.js', import.meta.url)));
function cmd(exe, args, cwd) {
  return spawnSync(exe, args, { cwd, encoding: 'utf8', shell: false });
}
function repo(t) {
  const root = mkdtempSync(join(tmpdir(), 'agx-sfg-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(cmd('git', ['init', '-q'], root).status, 0);
  return root;
}
function stage(root, name, content = 'CANARY_SECRET_MUST_NEVER_BE_PRINTED') {
  const file = join(root, name);
  mkdirSync(resolve(file, '..'), { recursive: true });
  writeFileSync(file, content);
  const result = cmd('git', ['add', '--', name], root);
  assert.equal(result.status, 0, result.stderr);
}
function run(root, ...args) { return cmd(process.execPath, [CLI, '--cwd', root, ...args], root); }

test('help, unknown option, missing value, duplicate directory', () => {
  const help = cmd(process.execPath, [CLI, '--help']);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Exit codes/);
  assert.equal(cmd(process.execPath, [CLI, '--wat']).status, 2);
  assert.equal(cmd(process.execPath, [CLI, '--cwd']).status, 2);
  assert.equal(cmd(process.execPath, [CLI, '--cwd', '.', '--root', '.']).status, 2);
});
test('outside a git repo returns 2 with JSON error', t => {
  const dir = mkdtempSync(join(tmpdir(), 'agx-no-git-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const r = run(dir, '--json');
  assert.equal(r.status, 2);
  assert.equal(JSON.parse(r.stdout).ok, false);
});
test('empty staging and safe file return 0', t => {
  const root = repo(t);
  assert.equal(run(root).status, 0);
  stage(root, 'src/app.js');
  assert.equal(run(root, '--json').status, 0);
  assert.deepEqual(JSON.parse(run(root, '--json').stdout).findings, []);
});
test('.env is flagged; .env.example and templates are ignored', t => {
  const root = repo(t);
  stage(root, '.env');
  stage(root, '.env.example');
  stage(root, 'docs/.env.template');
  stage(root, 'sub/.env.production');
  const r = run(root, '--json');
  assert.equal(r.status, 1);
  assert.deepEqual(JSON.parse(r.stdout).findings.map(x => x.path), ['.env', 'sub/.env.production']);
});
test('credential names, private keys and nested paths are detected', t => {
  const root = repo(t);
  for (const path of ['config/credentials.json', 'nested/a b/id_rsa', 'tls/server.pem', 'tls/cert.p12', '.npmrc', 'config/service_account_prod.json']) stage(root, path);
  const r = run(root, '--json');
  assert.equal(r.status, 1);
  assert.equal(JSON.parse(r.stdout).count, 6);
});
test('newlines, spaces and UTF-8 are preserved by NUL parsing', t => {
  const root = repo(t);
  stage(root, 'pasta com espaço/linha\nnova/.env');
  stage(root, 'configuração/.env.local');
  const r = run(root, '--json');
  assert.equal(r.status, 1);
  const paths = JSON.parse(r.stdout).findings.map(x => x.path);
  assert.ok(paths.includes('pasta com espaço/linha\nnova/.env'));
  assert.ok(paths.includes('configuração/.env.local'));
  assert.doesNotMatch(r.stdout, /CANARY_SECRET_MUST_NEVER_BE_PRINTED/);
});
test('running from nested cwd scans entire repository; --root alias works', t => {
  const root = repo(t);
  stage(root, '.env');
  mkdirSync(join(root, 'nested'), { recursive: true });
  assert.equal(run(join(root, 'nested'), '--json').status, 1);
  const r = cmd(process.execPath, [CLI, '--root', join(root, 'nested'), '--json']);
  assert.equal(r.status, 1);
});
test('example credential names are ignored; other suspicious names flagged', () => {
  assert.equal(classifyPath('config/credentials.example.json'), null);
  assert.equal(classifyPath('config/credentials.json'), 'credential-like JSON filename');
  assert.equal(classifyPath('src/app.js'), null);
  assert.equal(classifyPath('id_ed25519.pub'), null);
  assert.ok(classifyPath('keys/id_ed25519'));
});
test('text output quotes control characters; never emits file contents', t => {
  const root = repo(t);
  stage(root, 'x\u001b[31m/.env');
  const r = run(root);
  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stdout, /\u001b/);
  assert.match(r.stdout, /\\u001b/);
  assert.doesNotMatch(r.stdout, /CANARY_SECRET_MUST_NEVER_BE_PRINTED/);
});

test('CLI invoked via a symlink still runs', t => {
  const root = repo(t);
  stage(root, '.env');
  const link = join(root, 'guard-bin');
  symlinkSync(CLI, link);
  const r = cmd(process.execPath, [link, '--cwd', root, '--json'], root);
  assert.equal(r.status, 1);
  assert.equal(JSON.parse(r.stdout).count, 1);
});
