export function mapVal(num: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function clamp(num: number, min: number, max: number) {
  return num <= min ? min : num >= max ? max : num;
}

/** Scroll-linked vertical offset (px) for project tile titles. */
export function projectTileParallaxTranslateY(
  yPos: number,
  viewportHeight: number,
  wideLayout: boolean,
): number {
  const buffer = 50;
  // mapVal: element at top of viewport → first pair; at bottom → second pair.
  let outAtTop: number;
  let outAtBottom: number;
  if (wideLayout) {
    outAtTop = 100;
    outAtBottom = -80;
  } else {
    // Narrow: only negative translateY (move up), so labels are not clipped at tile bottom.
    outAtTop = 40;
    outAtBottom = 0;
  }

  const bottomVal = clamp(
    mapVal(yPos, 0, viewportHeight, outAtTop, outAtBottom),
    outAtBottom - buffer,
    outAtTop + buffer,
  );
  return -bottomVal;
}
