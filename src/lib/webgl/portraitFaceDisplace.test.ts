import { describe, expect, it } from 'vitest';
import {
  expandFaces,
  portraitFaceFalloff,
  portraitFaceOffset,
  portraitPointerNdc,
  portraitValueNoise,
  PORTRAIT_FACE_RADIUS,
} from './portraitFaceDisplace';

const camera = {
  cameraRight: { x: 1, y: 0, z: 0 },
  cameraUp: { x: 0, y: 1, z: 0 },
  viewDirection: { x: 0, y: 0, z: 1 },
};

describe('expandFaces', () => {
  it('splits a quad into six corners and two repeated centroids', () => {
    const positions = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0];
    const index = [0, 1, 2, 0, 2, 3];
    const expanded = expandFaces(positions, index);

    expect(expanded.positions.length).toBe(18);
    expect(expanded.centroids.length).toBe(18);
    expect(Array.from(expanded.positions.slice(0, 9))).toEqual([0, 0, 0, 1, 0, 0, 1, 1, 0]);

    const first = [2 / 3, 1 / 3, 0];
    const second = [1 / 3, 2 / 3, 0];
    for (let corner = 0; corner < 3; corner++) {
      expect(expanded.centroids[corner * 3]).toBeCloseTo(first[0]);
      expect(expanded.centroids[corner * 3 + 1]).toBeCloseTo(first[1]);
      expect(expanded.centroids[corner * 3 + 2]).toBeCloseTo(first[2]);
      expect(expanded.centroids[9 + corner * 3]).toBeCloseTo(second[0]);
      expect(expanded.centroids[9 + corner * 3 + 1]).toBeCloseTo(second[1]);
      expect(expanded.centroids[9 + corner * 3 + 2]).toBeCloseTo(second[2]);
    }
  });
});

describe('portraitFaceOffset', () => {
  const quad = expandFaces([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], [0, 1, 2, 0, 2, 3]);

  function offsetAt(sample: { x: number; y: number; z: number }, overrides: Partial<Parameters<typeof portraitFaceOffset>[0]> = {}) {
    return portraitFaceOffset({
      sample,
      hit: { x: 0.5, y: 0.5, z: 0 },
      strength: 1,
      radius: 2,
      time: 1.25,
      ...camera,
      ...overrides,
    });
  }

  it('is identical for corners that share a centroid', () => {
    const a = offsetAt({ x: quad.centroids[0], y: quad.centroids[1], z: quad.centroids[2] });
    const b = offsetAt({ x: quad.centroids[3], y: quad.centroids[4], z: quad.centroids[5] });
    const c = offsetAt({ x: quad.centroids[6], y: quad.centroids[7], z: quad.centroids[8] });
    expect(a).toEqual(b);
    expect(b).toEqual(c);
    expect(Math.hypot(a.x, a.y, a.z)).toBeGreaterThan(0);
  });

  it('is zero when strength is zero', () => {
    expect(offsetAt({ x: 0.5, y: 0.5, z: 0 }, { strength: 0 })).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('is zero when the sample is outside the radius', () => {
    expect(
      offsetAt({ x: 10, y: 0, z: 0 }, { hit: { x: 0, y: 0, z: 0 }, radius: PORTRAIT_FACE_RADIUS, strength: 1 }),
    ).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('pushes samples on opposite sides of the hit apart', () => {
    const hit = { x: 0, y: 0, z: 0 };
    const positive = offsetAt({ x: 0.15, y: 0, z: 0 }, { hit, radius: PORTRAIT_FACE_RADIUS, strength: 1 });
    const negative = offsetAt({ x: -0.15, y: 0, z: 0 }, { hit, radius: PORTRAIT_FACE_RADIUS, strength: 1 });
    expect(positive.x).toBeGreaterThan(negative.x);
  });

  it('gives nearby patches different offsets', () => {
    const hit = { x: 0, y: 0, z: 0 };
    const shared = { hit, radius: 1, strength: 1, time: 0.4, lift: 0 };
    const samples = [
      { x: 0.08, y: 0.02, z: 0 },
      { x: 0.02, y: 0.1, z: 0.04 },
    ];
    const wobble = samples.map((sample) => {
      const quiet = offsetAt(sample, { ...shared, noiseAmp: 0 });
      const noisy = offsetAt(sample, shared);
      return { x: noisy.x - quiet.x, y: noisy.y - quiet.y, z: noisy.z - quiet.z };
    });
    const delta = Math.hypot(wobble[0].x - wobble[1].x, wobble[0].y - wobble[1].y, wobble[0].z - wobble[1].z);
    expect(delta).toBeGreaterThan(0.05);
  });
});

describe('portraitFaceFalloff', () => {
  it('is 1 on the hit and 0 at the radius', () => {
    expect(portraitFaceFalloff(0, 0.45)).toBe(1);
    expect(portraitFaceFalloff(0.45, 0.45)).toBe(0);
    expect(portraitFaceFalloff(1, 0.45)).toBe(0);
    expect(portraitFaceFalloff(0.2, 0)).toBe(0);
  });
});

describe('portraitValueNoise', () => {
  it('stays within [-1, 1] and is deterministic', () => {
    expect(portraitValueNoise(0.2, 1.4)).toBe(portraitValueNoise(0.2, 1.4));
    for (let i = 0; i < 8; i++) {
      const n = portraitValueNoise(i * 0.37, -i * 0.2);
      expect(n).toBeGreaterThanOrEqual(-1);
      expect(n).toBeLessThanOrEqual(1);
    }
  });
});

describe('portraitPointerNdc', () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };

  it('maps the center to the origin and the top-left to NDC (-1, 1)', () => {
    expect(portraitPointerNdc(rect, 200, 100)).toEqual({ x: 0, y: 0 });
    expect(portraitPointerNdc(rect, 100, 50)).toEqual({ x: -1, y: 1 });
  });

  it('returns null outside the rect', () => {
    expect(portraitPointerNdc(rect, 99, 80)).toBeNull();
    expect(portraitPointerNdc({ left: 0, top: 0, width: 0, height: 10 }, 0, 0)).toBeNull();
  });
});
