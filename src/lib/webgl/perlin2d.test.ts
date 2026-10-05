import { describe, expect, it } from 'vitest';
import { hololensRayAlpha, Perlin2D } from './perlin2d';

describe('Perlin2D', () => {
  it('is deterministic for a fixed seed', () => {
    const a = new Perlin2D(42);
    const b = new Perlin2D(42);
    expect(a.get(1.5, 2.5)).toBe(b.get(1.5, 2.5));
  });

  it('differs across seeds', () => {
    const a = new Perlin2D(1);
    const b = new Perlin2D(2);
    expect(a.get(0.5, 0.5)).not.toBe(b.get(0.5, 0.5));
  });

  it('hololensRayAlpha stays in a reasonable range', () => {
    const p = new Perlin2D(9001);
    for (let i = 0; i < 5; i++) {
      const alpha = hololensRayAlpha(p, 0.2, -0.1, i, 1.2);
      expect(alpha).toBeGreaterThanOrEqual(-1);
      expect(alpha).toBeLessThanOrEqual(1);
    }
  });
});
