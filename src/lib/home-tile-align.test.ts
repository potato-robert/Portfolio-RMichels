import { describe, expect, it } from 'vitest';
import { visibleTileAlignments } from './home-tile-align';

describe('visibleTileAlignments', () => {
  it('alternates right then left for a contiguous run', () => {
    expect(visibleTileAlignments([true, true, true, true])).toEqual([
      'end',
      'start',
      'end',
      'start',
    ]);
  });

  it('alternates across visible tiles when some rows are filtered out', () => {
    expect(visibleTileAlignments([true, false, true, false, true])).toEqual([
      'end',
      null,
      'start',
      null,
      'end',
    ]);
  });

  it('starts on the right for whatever tile is shown first', () => {
    expect(visibleTileAlignments([false, false, true, true])).toEqual([
      null,
      null,
      'end',
      'start',
    ]);
  });
});
