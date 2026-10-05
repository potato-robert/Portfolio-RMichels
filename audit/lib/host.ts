import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export interface HostFingerprint {
  hostname: string;
  platform: string;
  arch: string;
  cpuModel: string;
  cores: number;
  totalMemoryGb: number;
  osRelease: string;
  /** Optional GPU string from WMIC on Windows or lspci stub */
  gpuHint: string | null;
  nodeVersion: string;
  benchmarkIndex?: number;
}

function readGpuHint(): string | null {
  try {
    if (process.platform === 'win32') {
      const out = execSync('wmic path win32_VideoController get name', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const lines = out
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(1);
      return lines[0] ?? null;
    }
  } catch {
    // ignore
  }
  return null;
}

export function getHostFingerprint(benchmarkIndex?: number): HostFingerprint {
  const cpus = os.cpus();
  return {
    hostname: os.hostname(),
    platform: process.platform,
    arch: process.arch,
    cpuModel: cpus[0]?.model ?? 'unknown',
    cores: cpus.length,
    totalMemoryGb: Math.round((os.totalmem() / 1024 ** 3) * 10) / 10,
    osRelease: os.release(),
    gpuHint: readGpuHint(),
    nodeVersion: process.version,
    benchmarkIndex,
  };
}

export function fingerprintKey(fp: HostFingerprint): string {
  return `${fp.hostname}|${fp.cpuModel}|${fp.cores}|${fp.totalMemoryGb}`;
}

export function readPackageVersion(name: string): string {
  try {
    const segments = name.startsWith('@') ? name.split('/') : [name];
    const pkgPath = path.join(root, 'node_modules', ...segments, 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    return (JSON.parse(raw) as { version: string }).version;
  } catch {
    return 'unknown';
  }
}

