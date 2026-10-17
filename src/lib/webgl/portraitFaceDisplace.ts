/**
 * CPU reference for the portrait face-separation effect.
 * Keep in sync with portraitFaceOffset() in src/lib/portrait-face-displace-shaders.ts.
 *
 * Positions are the GLB's local geometry (normalized, roughly a 2-unit head),
 * before the node's scale.
 */

/** How far from the hit, in local units, a face still moves. */
export const PORTRAIT_FACE_RADIUS = 0.34;

/** Local units a fully influenced face slides away from the cursor. */
export const PORTRAIT_FACE_SEPARATION = 0.04;

/** Fraction of the slide applied toward the camera. */
export const PORTRAIT_FACE_LIFT = 0.18;

/** Fraction of the slide applied as in-plane noise. Stays below the minimum push so faces still open outward. */
export const PORTRAIT_FACE_NOISE = 0.42;

/** Lowest share of the slide a face keeps after noise. The rest varies per patch. */
export const PORTRAIT_FACE_VARY_MIN = 0.4;

/** Below this planar distance the sideways push ramps in, so the face under the cursor lifts instead of jumping. */
export const PORTRAIT_FACE_PLANAR_RAMP = 0.08;

/** Broad drift, shared by a region of the head. */
export const PORTRAIT_FACE_NOISE_SCALE = 3.6;

/** Facet-scale variation so neighboring faces do not travel together. */
export const PORTRAIT_FACE_NOISE_FINE = 10.5;

export const PORTRAIT_NOISE_TIME_X = 0.128;
export const PORTRAIT_NOISE_TIME_Y = 0.076;
export const PORTRAIT_NOISE_TIME_Z = 0.099;
export const PORTRAIT_NOISE_TIME_W = 0.063;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ExpandedFaces {
  positions: Float32Array;
  centroids: Float32Array;
}

export interface PortraitFaceOffsetInput {
  sample: Vec3;
  hit: Vec3;
  strength: number;
  radius: number;
  time: number;
  cameraRight: Vec3;
  cameraUp: Vec3;
  /** Direction the camera looks, in the same space as sample and hit. */
  viewDirection: Vec3;
  lift?: number;
  noiseAmp?: number;
}

function fract(n: number): number {
  return n - Math.floor(n);
}

/** GLSL `fract(vec3(p.xyx) * 0.1031)` hash. Returns [0, 1). */
export function portraitHash(x: number, y: number): number {
  let p3x = fract(x * 0.1031);
  let p3y = fract(y * 0.1031);
  let p3z = fract(x * 0.1031);
  const d = p3x * (p3y + 33.33) + p3y * (p3z + 33.33) + p3z * (p3x + 33.33);
  p3x += d;
  p3y += d;
  p3z += d;
  return fract((p3x + p3y) * p3z);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** One octave of value noise in about [-1, 1]. */
export function portraitValueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = portraitHash(ix, iy);
  const b = portraitHash(ix + 1, iy);
  const c = portraitHash(ix, iy + 1);
  const d = portraitHash(ix + 1, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}

/** 1 at the hit, 0 at and beyond `radius`. */
export function portraitFaceFalloff(distance: number, radius: number): number {
  if (radius <= 0) return 0;
  const t = Math.min(1, Math.max(0, distance / radius));
  const s = t * t * (3 - 2 * t);
  return 1 - s;
}

/**
 * Rigid offset shared by every corner of a face (pass the face centroid)
 * or by a welded dot (pass the vertex).
 */
export function portraitFaceOffset(input: PortraitFaceOffsetInput): Vec3 {
  const strength = input.strength;
  const radius = input.radius;
  if (strength === 0 || radius <= 0) return { x: 0, y: 0, z: 0 };

  const dx = input.sample.x - input.hit.x;
  const dy = input.sample.y - input.hit.y;
  const dz = input.sample.z - input.hit.z;
  const dist = Math.hypot(dx, dy, dz);
  const falloff = portraitFaceFalloff(dist, radius) * strength;
  if (falloff === 0) return { x: 0, y: 0, z: 0 };

  const view = input.viewDirection;
  const alongView = dx * view.x + dy * view.y + dz * view.z;
  const px = dx - view.x * alongView;
  const py = dy - view.y * alongView;
  const pz = dz - view.z * alongView;
  const planarLen = Math.hypot(px, py, pz);
  const ramp = Math.min(planarLen / PORTRAIT_FACE_PLANAR_RAMP, 1);
  const invPlanar = planarLen > 1e-6 ? ramp / planarLen : 0;
  const planarX = px * invPlanar;
  const planarY = py * invPlanar;
  const planarZ = pz * invPlanar;

  const lift = input.lift ?? PORTRAIT_FACE_LIFT;
  const noiseAmp = input.noiseAmp ?? PORTRAIT_FACE_NOISE;
  const time = input.time;
  const nFine = portraitValueNoise(
    input.sample.x * PORTRAIT_FACE_NOISE_FINE + time * PORTRAIT_NOISE_TIME_X,
    input.sample.y * PORTRAIT_FACE_NOISE_FINE + time * PORTRAIT_NOISE_TIME_Y,
  );
  const nCoarse = portraitValueNoise(
    input.sample.y * PORTRAIT_FACE_NOISE_SCALE - time * PORTRAIT_NOISE_TIME_W,
    input.sample.z * PORTRAIT_FACE_NOISE_SCALE + time * PORTRAIT_NOISE_TIME_Z,
  );
  const nDir = portraitValueNoise(
    input.sample.x * PORTRAIT_FACE_NOISE_SCALE + time * PORTRAIT_NOISE_TIME_Z,
    input.sample.z * PORTRAIT_FACE_NOISE_FINE - time * PORTRAIT_NOISE_TIME_X,
  );
  const vary = PORTRAIT_FACE_VARY_MIN + (1 - PORTRAIT_FACE_VARY_MIN) * (nFine * 0.5 + 0.5);
  const liftScale = 0.35 + 0.65 * (nCoarse * 0.5 + 0.5);

  const right = input.cameraRight;
  const up = input.cameraUp;
  return {
    x: (planarX * vary + -view.x * lift * liftScale + (right.x * nCoarse + up.x * nDir) * noiseAmp) * falloff,
    y: (planarY * vary + -view.y * lift * liftScale + (right.y * nCoarse + up.y * nDir) * noiseAmp) * falloff,
    z: (planarZ * vary + -view.z * lift * liftScale + (right.z * nCoarse + up.z * nDir) * noiseAmp) * falloff,
  };
}

/** Extra bounding-sphere radius so separated faces are not frustum-culled. */
export function portraitFaceDisplacementPad(): number {
  return PORTRAIT_FACE_SEPARATION * (1 + PORTRAIT_FACE_LIFT + PORTRAIT_FACE_NOISE * Math.SQRT2);
}

/**
 * One triangle becomes three unique corners that share a centroid, so the
 * shader can translate each facet without stretching it.
 */
export function expandFaces(positions: ArrayLike<number>, index: ArrayLike<number> | null): ExpandedFaces {
  const triCount = index ? Math.floor(index.length / 3) : Math.floor(positions.length / 9);
  const outPositions = new Float32Array(triCount * 9);
  const centroids = new Float32Array(triCount * 9);

  for (let tri = 0; tri < triCount; tri++) {
    const i0 = index ? index[tri * 3] : tri * 3;
    const i1 = index ? index[tri * 3 + 1] : tri * 3 + 1;
    const i2 = index ? index[tri * 3 + 2] : tri * 3 + 2;
    const ax = positions[i0 * 3];
    const ay = positions[i0 * 3 + 1];
    const az = positions[i0 * 3 + 2];
    const bx = positions[i1 * 3];
    const by = positions[i1 * 3 + 1];
    const bz = positions[i1 * 3 + 2];
    const cx = positions[i2 * 3];
    const cy = positions[i2 * 3 + 1];
    const cz = positions[i2 * 3 + 2];
    const cenX = (ax + bx + cx) / 3;
    const cenY = (ay + by + cy) / 3;
    const cenZ = (az + bz + cz) / 3;
    const base = tri * 9;
    outPositions[base] = ax;
    outPositions[base + 1] = ay;
    outPositions[base + 2] = az;
    outPositions[base + 3] = bx;
    outPositions[base + 4] = by;
    outPositions[base + 5] = bz;
    outPositions[base + 6] = cx;
    outPositions[base + 7] = cy;
    outPositions[base + 8] = cz;
    for (let corner = 0; corner < 3; corner++) {
      const o = base + corner * 3;
      centroids[o] = cenX;
      centroids[o + 1] = cenY;
      centroids[o + 2] = cenZ;
    }
  }

  return { positions: outPositions, centroids };
}

export function portraitPointerNdc(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const px = (clientX - rect.left) / rect.width;
  const py = (clientY - rect.top) / rect.height;
  if (px < 0 || px > 1 || py < 0 || py > 1) return null;
  return { x: px * 2 - 1, y: 1 - py * 2 };
}
