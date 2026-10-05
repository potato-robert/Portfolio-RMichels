import { describe, expect, it } from 'vitest';
import {
  createJoeiddonPerlinState,
  hololensRayAlphaFromLegacyPerlin,
  joeiddonPerlin,
} from './joeiddon-perlin';

describe('joeiddonPerlin', () => {
  it('matches legacy hololensRayAlpha formula range', () => {
    const state = createJoeiddonPerlinState();
    for (let i = 0; i < 8; i++) {
      const alpha = hololensRayAlphaFromLegacyPerlin(state, 0.2, -0.1, i, 1.2);
      expect(alpha).toBeGreaterThanOrEqual(-1);
      expect(alpha).toBeLessThanOrEqual(1);
    }
  });

  it('re-seeds gradients and memory', () => {
    const state = createJoeiddonPerlinState();
    const v1 = joeiddonPerlin.get(1.1, 2.2, state);
    joeiddonPerlin.seed(state);
    const v2 = joeiddonPerlin.get(1.1, 2.2, state);
    expect(v1).not.toBe(v2);
  });
});
