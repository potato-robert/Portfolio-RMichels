import type { AuditProfile } from '../config/profiles.ts';
import { throwIfAborted } from './abort.ts';
import { runDockerInteraction } from './docker.ts';

export const DOCKER_SMOKE_PAGE = '/';

export interface DockerSmokeResult {
  passed: boolean;
  profileId: string;
  pagePath: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}

export function shouldRunDockerSmoke(options: {
  target: 'local' | 'prod';
  stages: Set<string>;
  profiles: AuditProfile[];
}): boolean {
  if (options.target !== 'local') return false;
  if (!options.stages.has('interaction')) return false;
  return options.profiles.some((p) => p.docker);
}

export function pickDockerSmokeProfile(profiles: AuditProfile[]): AuditProfile | undefined {
  const dockerProfiles = profiles.filter((p) => p.docker);
  return dockerProfiles.find((p) => p.id === 'docker-2cpu-2gb') ?? dockerProfiles[0];
}

export function formatDockerSmokeFailure(result: DockerSmokeResult): string {
  const blob = `${result.stderr}\n${result.stdout}`;
  if (/not allowed|allowedHosts/i.test(blob)) {
    return (
      `Docker smoke failed (${result.profileId} ${result.pagePath}): Vite preview blocked Host "host.docker.internal".\n` +
      'Add host.docker.internal to vite.preview.allowedHosts in astro.config.mjs, rebuild, and restart preview.'
    );
  }
  const errLine = (result.stderr || result.stdout || 'non-zero exit').split('\n')[0];
  return (
    `Docker smoke failed (${result.profileId} ${result.pagePath}, exit ${result.exitCode}): ${errLine}\n` +
    'If tier stayed "unknown", client JS may not have run (preview 403, asset errors) or data-perf-tier did not match AUDIT_TIER in time.'
  );
}

export function runDockerSmoke(options: {
  profiles: AuditProfile[];
  baseUrl: string;
  onProgress?: (msg: string) => void;
  signal?: AbortSignal;
}): DockerSmokeResult {
  throwIfAborted(options.signal);
  const profile = pickDockerSmokeProfile(options.profiles);
  if (!profile?.docker) {
    throw new Error('runDockerSmoke called without a Docker profile in the list');
  }

  options.onProgress?.(
    `Docker smoke: ${profile.id} on ${DOCKER_SMOKE_PAGE} (fails fast before Lighthouse)`,
  );
  let run = runDockerInteraction(
    profile,
    options.baseUrl,
    [DOCKER_SMOKE_PAGE, profile.id],
    options.onProgress,
  );
  if (run.exitCode !== 0) {
    options.onProgress?.('Docker smoke: first attempt failed, retrying once…');
    run = runDockerInteraction(
      profile,
      options.baseUrl,
      [DOCKER_SMOKE_PAGE, profile.id],
      options.onProgress,
    );
  }
  return {
    passed: run.exitCode === 0,
    profileId: profile.id,
    pagePath: DOCKER_SMOKE_PAGE,
    exitCode: run.exitCode,
    stdout: run.stdout,
    stderr: run.stderr,
  };
}
