import { describe, expect, it } from 'vitest';
import { projectTileParallaxTranslateY } from './project-tile-parallax';

describe('projectTileParallaxTranslateY', () => {
  const vh = 800;

  it('moves narrow-layout titles upward only (never positive translateY)', () => {
    for (let y = 0; y <= vh; y += 40) {
      const ty = projectTileParallaxTranslateY(y, vh, false);
      expect(ty).toBeLessThanOrEqual(0);
    }
    expect(projectTileParallaxTranslateY(0, vh, false)).toBe(-40);
    expect(projectTileParallaxTranslateY(vh, vh, false)).toBeCloseTo(0, 5);
  });

  it('allows bidirectional motion on wide layout', () => {
    expect(projectTileParallaxTranslateY(0, vh, true)).toBe(-100);
    expect(projectTileParallaxTranslateY(vh, vh, true)).toBe(80);
  });
});
