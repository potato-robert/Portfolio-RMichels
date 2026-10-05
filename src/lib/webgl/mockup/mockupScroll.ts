/** Scroll-driven mockup rotation (legacy scrollUpdate + quadraticTransform). */

export function quadraticTransform(value: number): number {
  const sign = value >= 0 ? 1 : -1;
  return sign * value ** 2;
}

export interface MockupScrollRotationInput {
  animatedScroll: number;
  canvasTop: number;
  canvasHeight: number;
  initialRotationY: number;
  scrollDivisor: number;
}

/** Returns mockup mesh rotation.y for the current scroll position. */
export function computeMockupScrollRotationY(input: MockupScrollRotationInput): number {
  const canvasScrollTop = input.canvasTop + input.animatedScroll - input.canvasHeight / 6;
  const diff = input.animatedScroll - canvasScrollTop;
  const scaledDiff = quadraticTransform(diff / input.scrollDivisor);
  return input.initialRotationY + scaledDiff;
}
