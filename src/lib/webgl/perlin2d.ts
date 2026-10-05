/** Seeded 2D value noise (deterministic hololens ray flicker; legacy used global perlin). */

function hashSeed(seed: number, x: number, y: number): number {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) >>> 0;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export class Perlin2D {
  private readonly seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  /** Returns roughly [-1, 1] before legacy scaling. */
  get(x: number, y: number): number {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = x0 + 1;
    const y1 = y0 + 1;
    const sx = fade(x - x0);
    const sy = fade(y - y0);

    const n00 = grad(hashSeed(this.seed, x0, y0), x - x0, y - y0);
    const n10 = grad(hashSeed(this.seed, x1, y0), x - x1, y - y0);
    const n01 = grad(hashSeed(this.seed, x0, y1), x - x0, y - y1);
    const n11 = grad(hashSeed(this.seed, x1, y1), x - x1, y - y1);

    const ix0 = lerp(n00, n10, sx);
    const ix1 = lerp(n01, n11, sx);
    return lerp(ix0, ix1, sy);
  }
}

/** Legacy ray alpha: perlin * 0.8 */
export function hololensRayAlpha(perlin: Perlin2D, cameraX: number, cameraY: number, index: number, timeShift: number): number {
  return perlin.get((cameraX * 0.4 + index / 5 + timeShift) / 2, (cameraY * 0.4) / 2) * 0.8;
}
