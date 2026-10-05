import { describe, expect, it } from 'vitest';
import {
  WAVE_COUNT_STEP,
  advanceWaveCount,
  deltaTimeScale,
  lerpFactorPerFrame,
  waveParticleScale,
  waveParticleY,
} from './wave-formula';

describe('waveParticleY', () => {
  it('matches legacy CPU formula at count=0', () => {
    expect(waveParticleY(3, 5, 0)).toBeCloseTo(
      Math.sin(3 * 0.3) * 200 + Math.sin(5 * 0.5) * 100,
    );
  });

  it('shifts with count like ix/iy offset', () => {
    const a = waveParticleY(1, 2, 10);
    const b = waveParticleY(11, 12, 0);
    expect(a).toBeCloseTo(b);
  });
});

describe('waveParticleScale', () => {
  it('matches legacy CPU formula', () => {
    expect(waveParticleScale(2, 4, 1)).toBeCloseTo(
      (Math.sin((2 + 1) * 0.3) + 1) * 8 + (Math.sin((4 + 1) * 0.5) + 1) * 1,
    );
  });
});

describe('deltaTimeScale', () => {
  it('returns 1 at 60 Hz', () => {
    expect(deltaTimeScale(1000 / 60)).toBeCloseTo(1, 5);
  });

  it('returns ~2 at 120 Hz', () => {
    expect(deltaTimeScale(1000 / 120)).toBeCloseTo(0.5, 5);
  });

  it('clamps large deltas', () => {
    expect(deltaTimeScale(500)).toBe(deltaTimeScale(100));
  });

  it('clamps negative deltas', () => {
    expect(deltaTimeScale(-10)).toBe(0);
  });
});

describe('advanceWaveCount', () => {
  it('advances by 0.02 per 60 Hz frame', () => {
    expect(advanceWaveCount(0, 1000 / 60)).toBeCloseTo(WAVE_COUNT_STEP);
  });

  it('advances half as much per frame at 120 Hz (same rate over wall time)', () => {
    const at60 = advanceWaveCount(0, 1000 / 60);
    const at120 = advanceWaveCount(0, 1000 / 120);
    expect(at120).toBeCloseTo(at60 * 0.5);
    expect(advanceWaveCount(0, 1000 / 60 * 2)).toBeCloseTo(advanceWaveCount(0, 1000 / 120 * 4));
  });
});

describe('lerpFactorPerFrame', () => {
  it('matches base factor at 60 Hz', () => {
    expect(lerpFactorPerFrame(0.015, 1000 / 60)).toBeCloseTo(0.015, 5);
  });

  it('matches smoothing over wall time at 60 vs 120 Hz', () => {
    const target = 1;
    let at60 = 0;
    for (let i = 0; i < 2; i++) {
      at60 += (target - at60) * lerpFactorPerFrame(0.015, 1000 / 60);
    }
    let at120 = 0;
    for (let i = 0; i < 4; i++) {
      at120 += (target - at120) * lerpFactorPerFrame(0.015, 1000 / 120);
    }
    expect(at120).toBeCloseTo(at60, 4);
  });
});
