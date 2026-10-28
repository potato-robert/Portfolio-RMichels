/** First visible home tile aligns right (`end`); each following visible tile alternates. */
export function visibleTileAlignments(
  visibleFlags: boolean[],
): Array<'end' | 'start' | null> {
  let visibleIndex = 0;
  return visibleFlags.map((visible) => {
    if (!visible) return null;
    const side = visibleIndex % 2 === 0 ? 'end' : 'start';
    visibleIndex += 1;
    return side;
  });
}
