/**
 * Joe Iddon 2D Perlin noise — vendored from legacy site footer:
 * https://joeiddon.github.io/perlin/perlin.js (see git: src/partials/footer.php)
 */

type Vec2 = { x: number; y: number };

export type PerlinState = {
  gradients: Record<string, Vec2>;
  memory: Record<string, number>;
};

function key(x: number, y: number): string {
  return `${x},${y}`;
}

export const joeiddonPerlin = {
  rand_vect(): Vec2 {
    const theta = Math.random() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  },

  dot_prod_grid(x: number, y: number, vx: number, vy: number, state: PerlinState): number {
    const k = key(vx, vy);
    let g_vect: Vec2;
    const d_vect = { x: x - vx, y: y - vy };
    if (state.gradients[k]) {
      g_vect = state.gradients[k];
    } else {
      g_vect = this.rand_vect();
      state.gradients[k] = g_vect;
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  },

  smootherstep(x: number): number {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  },

  interp(x: number, a: number, b: number): number {
    return a + this.smootherstep(x) * (b - a);
  },

  seed(state: PerlinState): void {
    state.gradients = {};
    state.memory = {};
  },

  get(x: number, y: number, state: PerlinState): number {
    const memKey = key(x, y);
    if (Object.prototype.hasOwnProperty.call(state.memory, memKey)) {
      return state.memory[memKey];
    }
    const xf = Math.floor(x);
    const yf = Math.floor(y);
    const tl = this.dot_prod_grid(x, y, xf, yf, state);
    const tr = this.dot_prod_grid(x, y, xf + 1, yf, state);
    const bl = this.dot_prod_grid(x, y, xf, yf + 1, state);
    const br = this.dot_prod_grid(x, y, xf + 1, yf + 1, state);
    const xt = this.interp(x - xf, tl, tr);
    const xb = this.interp(x - xf, bl, br);
    const v = this.interp(y - yf, xt, xb);
    state.memory[memKey] = v;
    return v;
  },
};

export function createJoeiddonPerlinState(): PerlinState {
  const state: PerlinState = { gradients: {}, memory: {} };
  joeiddonPerlin.seed(state);
  return state;
}

/** Legacy hololens ray flicker: perlin.get(...) * 0.8 */
export function hololensRayAlphaFromLegacyPerlin(
  state: PerlinState,
  cameraX: number,
  cameraY: number,
  index: number,
  timeShift: number,
): number {
  return (
    joeiddonPerlin.get((cameraX * 0.4 + index / 5 + timeShift) / 2, (cameraY * 0.4) / 2, state) *
    0.8
  );
}
