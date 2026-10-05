import { describe, expect, it } from 'vitest';
import { shouldSkipMockupGlb } from './createMockupRuntime';

describe('shouldSkipMockupGlb', () => {
  it('skips all GLB on minimal tier', () => {
    expect(shouldSkipMockupGlb('minimal', 'phone')).toBe(true);
    expect(shouldSkipMockupGlb('minimal', 'hololens')).toBe(true);
  });

  it('loads phone but skips hololens on reduced tier', () => {
    expect(shouldSkipMockupGlb('reduced', 'phone')).toBe(false);
    expect(shouldSkipMockupGlb('reduced', 'hololens')).toBe(true);
  });

  it('loads both on full tier', () => {
    expect(shouldSkipMockupGlb('full', 'phone')).toBe(false);
    expect(shouldSkipMockupGlb('full', 'hololens')).toBe(false);
  });
});
