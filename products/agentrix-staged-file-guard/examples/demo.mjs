#!/usr/bin/env node
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
if (!['safe', 'flagged'].includes(mode) || process.argv.length !== 3) {
  console.error('Usage: node examples/demo.mjs safe|flagged');
  process.exitCode = 2;
} else {
  const root = mkdtempSync(join(tmpdir(), 'agentrix-staged-demo-'));
  try {
    const git = args => {
      const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', shell: false });
      if (result.error || result.status !== 0) throw new Error('Cannot prepare synthetic Git demo');
    };
    git(['init', '-q']);
    const filename = mode === 'safe' ? '.env.example' : '.env';
    writeFileSync(join(root, filename), 'SYNTHETIC_EXAMPLE_ONLY=placeholder\n');
    git(['add', '--', filename]);
    const cli = fileURLToPath(new URL('../src/cli.js', import.meta.url));
    const result = spawnSync(process.execPath, [cli, '--cwd', root, '--json'], { encoding: 'utf8', shell: false });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exitCode = result.error ? 2 : result.status ?? 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
