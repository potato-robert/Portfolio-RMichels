/** JS reference of GPU wave math (unit-tested; kept in sync with particle-waves-shaders). */

export const WAVE_COUNT_STEP = 0.02;
export const FRAME_MS = 1000 / 60;

export function waveParticleY(ix: number, iy: number, count: number): number {
  return Math.sin((ix + count) * 0.3) * 200 + Math.sin((iy + count) * 0.5) * 100;
}

export function waveParticleScale(ix: number, iy: number, count: number): number {
  return (Math.sin((ix + count) * 0.3) + 1) * 8 + (Math.sin((iy + count) * 0.5) + 1) * 1;
}

/** Normalized delta: 1 at 60 Hz, ~2 at 120 Hz; clamped to avoid tab-switch spikes. */
export function deltaTimeScale(deltaMs: number): number {
  const clamped = Math.min(Math.max(deltaMs, 0), 100);
  return clamped / FRAME_MS;
}

export function advanceWaveCount(count: number, deltaMs: number): number {
  return count + WAVE_COUNT_STEP * deltaTimeScale(deltaMs);
}

/** Frame-rate-independent exponential lerp factor (base = per-frame factor at 60 Hz). */
export function lerpFactorPerFrame(base: number, deltaMs: number): number {
  const dt60 = deltaTimeScale(deltaMs);
  return 1 - (1 - base) ** dt60;
}
