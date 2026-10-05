import { spawn, type ChildProcess } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditChildEnv } from './spawn-env.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_PORT = 4321;

export interface PreviewServer {
  baseUrl: string;
  stop: () => void;
}

export async function isPreviewReachable(port = DEFAULT_PORT): Promise<boolean> {
  for (const host of ['127.0.0.1', 'localhost']) {
    try {
      const res = await fetch(`http://${host}:${port}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch {
      // not reachable on this host
    }
  }
  return false;
}

export function needsPreviewServer(stages: Set<string>): boolean {
  return stages.has('lighthouse') || stages.has('interaction');
}

export async function ensurePreviewServer(port = DEFAULT_PORT): Promise<PreviewServer | null> {
  const baseUrl = `http://127.0.0.1:${port}`;

  if (await isPreviewReachable(port)) return null;

  const child: ChildProcess = spawn(
    'npm',
    ['run', 'preview', '--', '--port', String(port), '--host', '0.0.0.0', '--force'],
    {
      cwd: root,
      shell: true,
      stdio: 'ignore',
      env: auditChildEnv(),
    },
  );

  for (let i = 0; i < 90; i++) {
    if (await isPreviewReachable(port)) {
      return {
        baseUrl,
        stop: () => {
          child.kill();
        },
      };
    }
    await delay(500);
  }

  child.kill();
  throw new Error(
    `Preview server did not start on port ${port}. Run: npm run build && npm run preview`,
  );
}

export function prodBaseUrl(): string {
  return 'https://rmichels.com';
}
