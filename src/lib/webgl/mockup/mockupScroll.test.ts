import { describe, expect, it } from 'vitest';
import { computeMockupScrollRotationY, quadraticTransform } from './mockupScroll';

describe('quadraticTransform', () => {
  it('preserves sign and squares magnitude', () => {
    expect(quadraticTransform(2)).toBe(4);
    expect(quadraticTransform(-3)).toBe(-9);
    expect(quadraticTransform(0)).toBe(0);
  });
});

describe('computeMockupScrollRotationY', () => {
  it('returns initial rotation when viewport anchor matches canvas height/6', () => {
    const animatedScroll = 1000;
    const canvasHeight = 600;
    const canvasTop = canvasHeight / 6;
    const initial = 0.25;
    const y = computeMockupScrollRotationY({
      animatedScroll,
      canvasTop,
      canvasHeight,
      initialRotationY: initial,
      scrollDivisor: 1200,
    });
    expect(y).toBeCloseTo(initial);
  });

  it('adds quadratic offset when canvas sits above the scroll anchor', () => {
    const canvasHeight = 600;
    const y = computeMockupScrollRotationY({
      animatedScroll: 2000,
      canvasTop: canvasHeight / 6 - 200,
      canvasHeight,
      initialRotationY: 0,
      scrollDivisor: 1200,
    });
    expect(y).toBeGreaterThan(0);
  });
});
