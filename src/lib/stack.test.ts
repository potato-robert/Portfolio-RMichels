import { describe, expect, it } from 'vitest';
import { getStackLabel, stackFilterWithMatches, stacks, stacksInUse } from './stack';

describe('getStackLabel', () => {
  it('returns the display label for a known slug', () => {
    expect(getStackLabel('csharp')).toBe('C#');
    expect(getStackLabel('threejs')).toBe('Three.js');
  });

  it('returns the slug when it is unknown', () => {
    expect(getStackLabel('missing')).toBe('missing');
  });
});

describe('stackFilterWithMatches', () => {
  const projectStacks = [['unity', 'csharp'], ['figma']];

  it('keeps a slug that appears on a project', () => {
    expect(stackFilterWithMatches('unity', projectStacks)).toBe('unity');
    expect(stackFilterWithMatches('figma', projectStacks)).toBe('figma');
  });

  it('drops an empty, unknown, or unmatched filter', () => {
    expect(stackFilterWithMatches(null, projectStacks)).toBeNull();
    expect(stackFilterWithMatches('', projectStacks)).toBeNull();
    expect(stackFilterWithMatches('vr', projectStacks)).toBeNull();
    expect(stackFilterWithMatches('unity,csharp', projectStacks)).toBeNull();
  });
});

describe('stacksInUse', () => {
  it('keeps catalog order and drops unused slugs', () => {
    expect(stacksInUse(['rhino', 'csharp', 'csharp']).map((entry) => entry.slug)).toEqual([
      'csharp',
      'rhino',
    ]);
  });

  it('lists every catalog slug once', () => {
    const slugs = stacks.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
