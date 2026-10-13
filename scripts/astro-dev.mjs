/**
 * Always start Astro dev from the main repo root (not the `.perf-data` worktree).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

console.log('[dev] Launching Astro (rm-assets runs once on startup; first sync can take a few minutes)…');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
let repoRoot = path.resolve(scriptDir, '..');

if (path.basename(repoRoot) === '.perf-data') {
  repoRoot = path.resolve(repoRoot, '..');
}

const result = spawnSync('npx', ['astro', 'dev', ...process.argv.slice(2)], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
