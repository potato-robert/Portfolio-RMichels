/**
 * Docker-side interaction runner (Chromium + SwiftShader).
 * Args: <pagePath> <profileId>
 */
import { runDockerScenarios } from './scenario-runner.mjs';

const baseUrl = process.env.AUDIT_BASE_URL ?? 'http://host.docker.internal:4321';
const pagePath = process.argv[2] ?? '/';
const profileId = process.argv[3] ?? 'docker';
const auditTier = process.env.AUDIT_TIER;

function emit(payload) {
  console.log(JSON.stringify(payload));
}

for (let attempt = 0; attempt < 2; attempt++) {
  try {
    const payload = await runDockerScenarios({
      baseUrl,
      pagePath,
      profileId,
      expectedTier: auditTier || undefined,
    });
    emit(payload);
    process.exit(0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (attempt === 0) {
      continue;
    }
    emit({ ok: false, profileId, pagePath, error: message });
    console.error(message);
    process.exit(1);
  }
}
