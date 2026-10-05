import { describe, expect, it } from 'vitest';
import { normalizeAssetRel } from './constants.ts';

describe('normalizeAssetRel', () => {
  it('canonicalizes legacy lowercase gallery folders to slug casing', () => {
    expect(normalizeAssetRel('img/futureearth/lqip/3.jpg')).toBe('img/futureEarth/lqip/3.jpg');
    expect(normalizeAssetRel('img\\harbingersofdeath\\db.jpg')).toBe('img/harbingersOfDeath/db.jpg');
  });
});
