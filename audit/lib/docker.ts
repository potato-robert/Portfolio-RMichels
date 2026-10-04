import { execSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AuditProfile } from '../config/profiles.ts';

const dockerDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../docker');
let auditPlaywrightImageReady = false;

export function isDockerAvailable(): boolean {
  const r = spawnSync('docker', ['info'], { encoding: 'utf8', stdio: 'pipe' });
  return r.status === 0;
}

export function assertDockerForFull(profiles: AuditProfile[]): void {
  const needsDocker = profiles.some((p) => p.docker);
  if (!needsDocker) return;
  if (!isDockerAvailable()) {
    throw new Error(
      'Docker is required for full audit Docker profiles but `docker info` failed. ' +
        'Install Docker Desktop (WSL2 on Windows) and retry `npm run audit -- --level full`.',
    );
  }
}

export function runDockerInteraction(
  profile: AuditProfile,
  baseUrl: string,
  scriptArgs: string[],
  onProgress?: (msg: string) => void,
): { exitCode: number; stdout: string; stderr: string } {
  if (!profile.docker) {
    throw new Error(`Profile ${profile.id} is not a Docker profile`);
  }

  const hostUrl = baseUrl.replace('127.0.0.1', 'host.docker.internal');
  const imageTag = 'portfolio-audit-playwright';
  const dockerfile = path.join(dockerDir, 'Dockerfile');

  if (!auditPlaywrightImageReady) {
    onProgress?.('Docker: building portfolio-audit-playwright image (one-time)…');
    execSync(`docker build -t ${imageTag} -f "${dockerfile}" "${dockerDir}"`, {
      stdio: 'inherit',
    });
    auditPlaywrightImageReady = true;
    onProgress?.('Docker: image ready');
  }

  const args = [
    'run',
    '--rm',
    `--cpus=${profile.docker.cpus}`,
    `--memory=${profile.docker.memory}`,
    '-e',
    `AUDIT_BASE_URL=${hostUrl}`,
    '-e',
    `AUDIT_PROFILE=${profile.id}`,
  ];
  if (profile.expectedTier) {
    args.push('-e', `AUDIT_TIER=${profile.expectedTier}`);
  }
  if (process.platform === 'linux') {
    args.push('--add-host=host.docker.internal:host-gateway');
  }
  args.push(imageTag, ...scriptArgs);

  onProgress?.(`Docker run: ${profile.id} ${scriptArgs[0] ?? ''}`);
  const r = spawnSync('docker', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  onProgress?.(`Docker run: ${profile.id} exit ${r.status ?? 1}`);
  return {
    exitCode: r.status ?? 1,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
  };
}
