import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AuditAbortedError, throwIfAborted } from '../lib/abort.ts';
import { auditChildEnv } from '../lib/spawn-env.ts';
import {
  collectThreeRelatedChunkSizes,
  totalBytes,
  type ViteChunkSize,
} from '../lib/vite-chunks.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export interface CiGateResult {
  commands: Array<{
    name: string;
    exitCode: number;
    durationMs: number;
    outputTail: string;
  }>;
  viteThreeChunks?: ViteChunkSize[];
  viteThreeChunksTotalBytes?: number;
  passed: boolean;
}

const TAIL_LINES = 40;

function runNpmScript(
  script: string,
  options?: { onProgress?: (msg: string) => void; signal?: AbortSignal },
): Promise<{ exitCode: number; durationMs: number; output: string }> {
  return new Promise((resolve, reject) => {
    throwIfAborted(options?.signal);

    const start = Date.now();
    let output = '';
    const heartbeat = setInterval(() => {
      const sec = Math.round((Date.now() - start) / 1000);
      options?.onProgress?.(`CI gate: npm run ${script} still running (${sec}s)`);
    }, 30_000);

    const child: ChildProcess = spawn('npm', ['run', script], {
      cwd: root,
      shell: true,
      env: auditChildEnv(),
    });

    const onAbort = () => {
      child.kill('SIGTERM');
      reject(new AuditAbortedError());
    };
    options?.signal?.addEventListener('abort', onAbort, { once: true });

    child.stdout?.on('data', (d) => {
      output += d.toString();
    });
    child.stderr?.on('data', (d) => {
      output += d.toString();
    });
    child.on('close', (code) => {
      clearInterval(heartbeat);
      options?.signal?.removeEventListener('abort', onAbort);
      if (options?.signal?.aborted) {
        reject(new AuditAbortedError());
        return;
      }
      resolve({
        exitCode: code ?? 1,
        durationMs: Date.now() - start,
        output,
      });
    });
  });
}

function tailOutput(output: string): string {
  const lines = output.split(/\r?\n/);
  return lines.slice(-TAIL_LINES).join('\n');
}

export async function runCiGate(options?: {
  onProgress?: (msg: string) => void;
  signal?: AbortSignal;
}): Promise<CiGateResult> {
  const onProgress = options?.onProgress;
  const scripts = ['test:all', 'test:perf'];
  const commands: CiGateResult['commands'] = [];

  for (const name of scripts) {
    throwIfAborted(options?.signal);
    onProgress?.(`CI gate: starting npm run ${name}`);
    const result = await runNpmScript(name, { onProgress, signal: options?.signal });
    const sec = Math.round(result.durationMs / 1000);
    onProgress?.(`CI gate: npm run ${name} finished (exit ${result.exitCode}, ${sec}s)`);
    commands.push({
      name,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      outputTail: tailOutput(result.output),
    });
  }

  const viteThreeChunks = collectThreeRelatedChunkSizes(path.join(root, 'dist'));
  const viteThreeChunksTotalBytes = totalBytes(viteThreeChunks);
  if (viteThreeChunks.length > 0) {
    onProgress?.(
      `CI gate: Three-related Vite chunks (${viteThreeChunks.length} files, ${Math.round(viteThreeChunksTotalBytes / 1024)} KiB)`,
    );
  }

  return {
    commands,
    viteThreeChunks,
    viteThreeChunksTotalBytes,
    passed: commands.every((c) => c.exitCode === 0),
  };
}
