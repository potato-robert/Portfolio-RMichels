import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { HostFingerprint } from './host.ts';
import { ensurePerfDataLocalExclude } from './perf-data-publish.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const worktreePath = path.join(root, '.perf-data');
const branchName = 'perf-data';

export interface AuditManifest {
  runId: string;
  gitSha: string;
  gitBranch: string;
  dirty: boolean;
  target: 'local' | 'prod';
  level: 'quick' | 'full';
  label: string;
  profiles: string[];
  stages: string[];
  host: HostFingerprint;
  versions: {
    node: string;
    chromium?: string;
    lighthouse: string;
    playwright: string;
  };
  createdAt: string;
  completedAt?: string;
  status?: 'success' | 'failed' | 'aborted';
  failure?: { stage: string; message: string };
}

export interface AuditSummary {
  ciGate?: unknown;
  lighthouse?: unknown;
  seo?: unknown;
  interaction?: unknown;
  /** Plain-text run summary (also written to summary.txt). */
  logSummary?: string;
}

function git(cmd: string): string {
  return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
}

export function getGitState(): { sha: string; branch: string; dirty: boolean } {
  const sha = git('git rev-parse HEAD');
  const branch = git('git rev-parse --abbrev-ref HEAD');
  const dirty = git('git status --porcelain').length > 0;
  return { sha, branch, dirty };
}

function listedWorktreePaths(porcelain: string): string[] {
  return porcelain
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => path.resolve(line.slice('worktree '.length).trim()));
}

function pathsEqual(a: string, b: string): boolean {
  const na = path.resolve(a);
  const nb = path.resolve(b);
  if (process.platform === 'win32') {
    return na.toLowerCase() === nb.toLowerCase();
  }
  return na === nb;
}

/** True when `.perf-data` is already a linked worktree (`.git` file with gitdir). */
function isExistingPerfDataWorktree(): boolean {
  const gitFile = path.join(worktreePath, '.git');
  if (!fs.existsSync(gitFile) || !fs.statSync(gitFile).isFile()) return false;
  return fs.readFileSync(gitFile, 'utf8').trimStart().startsWith('gitdir:');
}

export function ensurePerfDataWorktree(): string {
  const porcelain = git('git worktree list --porcelain');
  const resolvedWorktree = path.resolve(worktreePath);
  const alreadyLinked =
    isExistingPerfDataWorktree() ||
    listedWorktreePaths(porcelain).some((p) => pathsEqual(p, resolvedWorktree));
  if (alreadyLinked) {
    if (!fs.existsSync(worktreePath)) {
      fs.mkdirSync(worktreePath, { recursive: true });
    }
    ensurePerfDataLocalExclude(worktreePath);
    return worktreePath;
  }

  const hasBranch = execSync('git branch --list perf-data', { cwd: root, encoding: 'utf8' }).trim();
  fs.mkdirSync(worktreePath, { recursive: true });

  if (!hasBranch) {
    const devRef = execSync('git rev-parse dev', { cwd: root, encoding: 'utf8' }).trim();
    execSync(`git branch perf-data ${devRef}`, { cwd: root });
  }

  execSync(`git worktree add "${worktreePath}" perf-data`, { cwd: root, stdio: 'inherit' });

  ensurePerfDataLocalExclude(worktreePath);
  return worktreePath;
}

export function createRunDir(
  level: 'quick' | 'full',
  label: string,
): { runDir: string; runId: string; worktree: string } {
  const worktree = ensurePerfDataWorktree();
  const { sha } = getGitState();
  const shortSha = sha.slice(0, 7);
  const iso = new Date().toISOString().replace(/[:.]/g, '-');
  const safeLabel = label.replace(/[^\w.-]+/g, '_') || 'run';
  const runId = `${iso}_${shortSha}_${level}_${safeLabel}`;
  const runDir = path.join(worktree, 'runs', runId);
  fs.mkdirSync(path.join(runDir, 'raw'), { recursive: true });
  return { runDir, runId, worktree };
}

export function writeManifest(runDir: string, manifest: AuditManifest): void {
  fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

export function writeSummary(runDir: string, summary: AuditSummary): void {
  fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2));
}

export function appendHistory(worktree: string, entry: Record<string, unknown>): void {
  const historyPath = path.join(worktree, 'history.jsonl');
  fs.appendFileSync(historyPath, `${JSON.stringify(entry)}\n`);
}

export function listRuns(worktree = worktreePath): string[] {
  const runsDir = path.join(worktree, 'runs');
  if (!fs.existsSync(runsDir)) return [];
  return fs
    .readdirSync(runsDir)
    .filter((d) => fs.existsSync(path.join(runsDir, d, 'manifest.json')))
    .sort();
}

export function readManifest(runId: string, worktree = worktreePath): AuditManifest {
  const raw = fs.readFileSync(path.join(worktree, 'runs', runId, 'manifest.json'), 'utf8');
  return JSON.parse(raw) as AuditManifest;
}

export function readSummary(runId: string, worktree = worktreePath): AuditSummary {
  const raw = fs.readFileSync(path.join(worktree, 'runs', runId, 'summary.json'), 'utf8');
  return JSON.parse(raw) as AuditSummary;
}

export function getWorktreePath(): string {
  return worktreePath;
}
