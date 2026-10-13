/**
 * Ensure node_modules is complete before npm run dev (Windows dev.bat).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

function log(message) {
  console.log(`[dev.bat] ${message}`);
}

function depsOk() {
  return (
    fs.existsSync(path.join(repoRoot, 'node_modules', 'astro', 'package.json')) &&
    fs.existsSync(path.join(repoRoot, 'node_modules', 'tsx', 'package.json'))
  );
}

function runStopDevServers(aggressive) {
  const args = ['scripts/stop-dev-server.mjs'];
  if (aggressive) args.push('--aggressive');
  spawnSync(process.execPath, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, DEV_BAT_EXCLUDE_PIDS: String(process.pid) },
  });
}

function removeNodeModules() {
  if (process.platform !== 'win32') {
    fs.rmSync(path.join(repoRoot, 'node_modules'), { recursive: true, force: true });
    return true;
  }

  const ps1 = path.join(scriptDir, 'remove-node-modules.ps1');
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1, '-RepoRoot', repoRoot],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  if (result.status !== 0) {
    if (result.stderr?.trim()) log(result.stderr.trim());
    return false;
  }

  const renamed = (result.stdout ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith('RENAMED:'));
  if (renamed) {
    log(`Moved locked node_modules aside (${path.basename(renamed.slice('RENAMED:'.length))}).`);
  }

  return !fs.existsSync(path.join(repoRoot, 'node_modules'));
}

function runNpmCi() {
  const result = spawnSync('npm', ['ci'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
  return result.status === 0;
}

if (!depsOk()) {
  log('Dependencies are missing or incomplete.');
  runStopDevServers(true);
  await setTimeout(1200);

  if (fs.existsSync(path.join(repoRoot, 'node_modules'))) {
    log('Removing node_modules...');
    if (!removeNodeModules()) {
      log('Could not remove node_modules. Close Cursor or any Node process using this repo, then run dev.bat again.');
      process.exit(1);
    }
  }

  log('Running npm ci...');
  if (!runNpmCi() || !depsOk()) {
    log('npm ci failed or dependencies are still incomplete.');
    process.exit(1);
  }
}

process.exit(0);
