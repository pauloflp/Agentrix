#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const USAGE = `Agentrix Staged File Guard
Usage: agentrix-staged-file-guard [--json] [--cwd DIRECTORY | --root DIRECTORY] [--help]

Checks staged Git paths only. Never reads file contents or sends data.
Exit codes: 0 = no flagged paths, 1 = flagged paths, 2 = usage/Git error.
`;

function parseArgs(argv) {
  let json = false;
  let directory = process.cwd();
  let hasDirectory = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--json') {
      if (json) throw new Error('Duplicate --json option');
      json = true;
      continue;
    }
    if (arg === '--cwd' || arg === '--root') {
      if (hasDirectory) throw new Error('Only one --cwd or --root may be specified');
      if (!argv[i + 1]) throw new Error(`${arg} requires a directory`);
      directory = resolve(argv[++i]);
      hasDirectory = true;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  return { json, directory };
}

function git(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    shell: false,
    encoding: 'buffer',
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error || result.status !== 0 || result.signal) {
    throw new Error('Git command failed; check that Git is installed and the directory is a repository');
  }
  return result.stdout;
}

function isExampleName(name) {
  return /(?:^|[._-])(example|sample|template|dist|dummy|mock)(?:$|[._-])/i.test(name);
}

export function classifyPath(path) {
  const filename = path.split('/').at(-1);
  const lower = filename.toLowerCase();
  if (/^\.env(?:\.|$)/.test(lower)) {
    if (isExampleName(lower)) return null;
    return 'environment configuration';
  }
  if (lower === '.npmrc' || lower === '.pypirc') return 'package registry configuration';
  if (/^id_(rsa|dsa|ecdsa|ed25519)(?:\.pem)?$/.test(lower)) return 'SSH private-key filename';
  if (/\.(pem|p12|pfx|jks|keystore|kdbx)$/.test(lower)) {
    if (lower.endsWith('.pem') && /(?:\.pub\.pem|public\.pem)$/.test(lower)) return null;
    return 'potential private key or credential container';
  }
  if (/\.(key)$/.test(lower) && !/\.pub\.key$/.test(lower)) return 'potential private-key file';
  if (/^(credentials|secrets|service[-_]account|service[-_]account[-_].+|gcp[-_]credentials)(?:\.[^.]+)?\.json$/.test(lower)) {
    if (isExampleName(lower)) return null;
    return 'credential-like JSON filename';
  }
  return null;
}

function stagedPaths(directory) {
  const rootOutput = git(['rev-parse', '--show-toplevel'], directory).toString('utf8');
  const root = rootOutput.endsWith('\n') ? rootOutput.slice(0, -1) : rootOutput;
  if (!root) throw new Error('Cannot resolve repository root');
  const output = git(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], root);
  if (output.length === 0) return [];
  if (output[output.length - 1] !== 0) throw new Error('Unexpected Git path output');
  return output.subarray(0, -1).toString('utf8').split('\0');
}

export function run(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
    if (options.help) {
      process.stdout.write(USAGE);
      return 0;
    }
    const findings = stagedPaths(options.directory)
      .map(path => ({ path, reason: classifyPath(path) }))
      .filter(item => item.reason !== null);
    if (options.json) {
      process.stdout.write(JSON.stringify({ ok: findings.length === 0, count: findings.length, findings }) + '\n');
    } else if (findings.length === 0) {
      process.stdout.write('No potentially sensitive staged paths found.\n');
    } else {
      process.stdout.write(`${findings.length} potentially sensitive staged path(s):\n`);
      for (const { path, reason } of findings) {
        process.stdout.write(`- ${JSON.stringify(path)} (${reason})\n`);
      }
      process.stdout.write('Review these staged paths before committing.\n');
    }
    return findings.length === 0 ? 0 : 1;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    if (options?.json) {
      process.stdout.write(JSON.stringify({ ok: false, error: message, count: 0, findings: [] }) + '\n');
    } else {
      process.stderr.write(`Error: ${message}\n`);
    }
    return 2;
  }
}

if (process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))) {
  process.exitCode = run();
}
