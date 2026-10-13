/**
 * Stop Astro/Vite dev processes for this repo (Windows dev.bat bootstrap).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const aggressive = process.argv.includes('--aggressive');

function log(message) {
  console.log(`[dev.bat] ${message}`);
}

if (process.platform === 'win32') {
  const ps1 = path.join(scriptDir, 'stop-dev-server.ps1');
  const args = [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    ps1,
    '-RepoRoot',
    repoRoot,
  ];
  if (aggressive) args.push('-Aggressive');

  const exclude = new Set(
    (process.env.DEV_BAT_EXCLUDE_PIDS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
  exclude.add(String(process.pid));

  const result = spawnSync('powershell.exe', args, {
    encoding: 'utf8',
    env: { ...process.env, DEV_BAT_EXCLUDE_PIDS: [...exclude].join(',') },
  });

  if (result.status !== 0 && result.stderr?.trim()) {
    log(`Warning: could not stop existing dev servers (${result.stderr.trim()})`);
  }

  const pids = new Set();
  for (const line of (result.stdout ?? '').split(/\r?\n/)) {
    const match = /^STOPPED:(\d+)$/.exec(line.trim());
    if (match) pids.add(match[1]);
  }

  if (pids.size > 0) {
    const label = aggressive ? 'Stopped Node/esbuild in repo' : 'Stopped dev server process(es)';
    log(`${label}: ${[...pids].join(', ')}`);
  }

  await setTimeout(aggressive ? 800 : 400);
}
