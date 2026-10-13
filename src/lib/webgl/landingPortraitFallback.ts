export type ViewportSize = { width: number; height: number };

function getViewportSize(): ViewportSize {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

/** Viewport overlap for the portrait layout probe (#threeModel). */
export function portraitLayoutRectIntersectsViewport(
  rect: DOMRectReadOnly,
  viewport: ViewportSize = getViewportSize(),
): boolean {
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (viewport.width <= 0 || viewport.height <= 0) return false;
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < viewport.height &&
    rect.left < viewport.width
  );
}

export function shouldScissorRenderPortrait(opts: {
  modelLoaded: boolean;
  rect: DOMRectReadOnly;
  viewport?: ViewportSize;
}): boolean {
  return opts.modelLoaded && portraitLayoutRectIntersectsViewport(opts.rect, opts.viewport);
}

/** Hide static WebP only after the GLB scissor path has drawn successfully. */
export function shouldHideLandingFallback(confirmedPortraitFrames: number, minFrames = 2): boolean {
  return confirmedPortraitFrames >= minFrames;
}

/**
 * Re-show WebP when fallback was hidden but the on-screen scissor path is not delivering frames.
 */
export function shouldRestoreLandingFallback(opts: {
  fallbackHidden: boolean;
  modelLoaded: boolean;
  rect: DOMRectReadOnly;
  confirmedPortraitFrames: number;
  framesWithoutConfirmedPortrait: number;
  missedPortraitRenderFrames: number;
  graceFrames: number;
  viewport?: ViewportSize;
}): boolean {
  if (!opts.fallbackHidden || !opts.modelLoaded) return false;
  if (!portraitLayoutRectIntersectsViewport(opts.rect, opts.viewport)) return false;

  if (opts.confirmedPortraitFrames === 0) {
    return opts.framesWithoutConfirmedPortrait >= opts.graceFrames;
  }

  return opts.missedPortraitRenderFrames >= opts.graceFrames;
}
