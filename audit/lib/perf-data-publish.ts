import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildCommittedSnapshot } from './snapshot-pack.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Appended to `.git/info/exclude` in the perf-data worktree (never committed). */
export const PERF_DATA_LOCAL_EXCLUDE_MARKER = '# audit local (npm run audit)';

export const PERF_DATA_LOCAL_EXCLUDE_LINES = ['runs/', 'history.jsonl', 'index.html'] as const;

export const SNAPSHOT_DIR = 'snapshot/latest';

const STAGE_TO_SUMMARY_KEY: Record<string, string> = {
  'ci-gate': 'ciGate',
  lighthouse: 'lighthouse',
  seo: 'seo',
  interaction: 'interaction',
};

function gitIn(worktree: string, cmd: string): string {
  return execSync(cmd, { cwd: worktree, encoding: 'utf8' }).trim();
}

function gitInRoot(cmd: string): string {
  return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
}

function shellQuote(arg: string): string {
  return `"${arg.replace(/"/g, '\\"')}"`;
}

function resolveGitDir(worktree: string): string {
  const gitPath = path.join(worktree, '.git');
  if (!fs.existsSync(gitPath)) {
    throw new Error(`No .git in perf-data worktree: ${worktree}`);
  }
  if (fs.statSync(gitPath).isDirectory()) {
    return gitPath;
  }
  const line = fs.readFileSync(gitPath, 'utf8').trim();
  const match = line.match(/^gitdir:\s*(.+)$/im);
  if (!match) {
    throw new Error(`Unrecognized .git file in worktree: ${gitPath}`);
  }
  return path.resolve(worktree, match[1].trim());
}

/** Keep full local runs out of git without touching the repo `.gitignore`. */
export function ensurePerfDataLocalExclude(worktree: string): void {
  const excludePath = path.join(resolveGitDir(worktree), 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  let content = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (content.includes(PERF_DATA_LOCAL_EXCLUDE_MARKER)) return;
  const block = [
    '',
    PERF_DATA_LOCAL_EXCLUDE_MARKER,
    ...PERF_DATA_LOCAL_EXCLUDE_LINES,
    '',
  ].join('\n');
  fs.writeFileSync(excludePath, content.replace(/\s*$/, '') + block);
}

/** Drop tracked run artifacts from older perf-data commits. */
export function untrackLocalPerfDataPaths(worktree: string): void {
  for (const rel of PERF_DATA_LOCAL_EXCLUDE_LINES) {
    try {
      gitIn(worktree, `git rm -r --cached --ignore-unmatch ${shellQuote(rel)}`);
    } catch {
      // not tracked
    }
  }
  try {
    gitIn(worktree, 'git rm -r --cached --ignore-unmatch snapshot');
  } catch {
    // ok
  }
}

export function materializeCommittedSnapshot(runDir: string, worktree: string): string {
  const dest = path.join(worktree, SNAPSHOT_DIR);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  const { filesWritten } = buildCommittedSnapshot(runDir, dest);
  console.log(`perf-data: packed ${filesWritten} snapshot file(s) under ${SNAPSHOT_DIR}/`);
  return dest;
}

/**
 * Move `perf-data` to current `dev`, then one normal commit that only adds/updates
 * `snapshot/latest/` (full repo tree unchanged vs dev; no mass deletions in diffs).
 */
export function publishLatestCompleteSnapshot(
  worktree: string,
  runDir: string,
  commitMessage: string,
): void {
  ensurePerfDataLocalExclude(worktree);
  untrackLocalPerfDataPaths(worktree);

  const devRef = gitInRoot('git rev-parse dev');
  gitIn(worktree, `git reset --hard ${devRef}`);
  ensurePerfDataLocalExclude(worktree);

  materializeCommittedSnapshot(runDir, worktree);
  gitIn(worktree, `git add ${shellQuote(SNAPSHOT_DIR)}`);
  const status = gitIn(worktree, 'git status --porcelain');
  if (!status.trim()) {
    console.warn('perf-data: snapshot unchanged vs dev; no commit created.');
    return;
  }
  execSync(`git commit -m ${shellQuote(commitMessage)}`, { cwd: worktree, stdio: 'inherit' });
}

export function auditStagesRecordedInSummary(
  stages: Iterable<string>,
  summary: Record<string, unknown>,
): boolean {
  for (const stage of stages) {
    const key = STAGE_TO_SUMMARY_KEY[stage];
    if (!key) continue;
    if (summary[key] == null) return false;
  }
  return true;
}

/** @deprecated use ensurePerfDataLocalExclude */
export const ensurePerfDataGitignore = ensurePerfDataLocalExclude;

/** @deprecated use PERF_DATA_LOCAL_EXCLUDE_LINES */
export const PERF_DATA_LOCAL_GITIGNORE = PERF_DATA_LOCAL_EXCLUDE_LINES.join('\n');
