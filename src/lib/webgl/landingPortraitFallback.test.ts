import { describe, expect, it } from 'vitest';
import {
  portraitLayoutRectIntersectsViewport,
  shouldHideLandingFallback,
  shouldRestoreLandingFallback,
  shouldScissorRenderPortrait,
} from './landingPortraitFallback';

function rect(
  partial: Partial<DOMRectReadOnly> & Pick<DOMRectReadOnly, 'width' | 'height'>,
): DOMRectReadOnly {
  return {
    x: partial.left ?? 0,
    y: partial.top ?? 0,
    top: partial.top ?? 0,
    left: partial.left ?? 0,
    bottom: partial.bottom ?? partial.top! + partial.height,
    right: partial.right ?? partial.left! + partial.width,
    width: partial.width,
    height: partial.height,
    toJSON: () => ({}),
  };
}

const viewport = { width: 1280, height: 800 };

describe('portraitLayoutRectIntersectsViewport', () => {
  it('rejects zero-sized rects', () => {
    expect(
      portraitLayoutRectIntersectsViewport(rect({ width: 0, height: 100, top: 0, left: 0 }), viewport),
    ).toBe(false);
  });

  it('accepts a typical hero portrait rect', () => {
    expect(
      portraitLayoutRectIntersectsViewport(
        rect({ width: 800, height: 600, top: 0, left: 200, bottom: 600, right: 1000 }),
        viewport,
      ),
    ).toBe(true);
  });

  it('rejects rects entirely below the viewport', () => {
    expect(
      portraitLayoutRectIntersectsViewport(
        rect({
          width: 400,
          height: 400,
          top: 900,
          left: 0,
          bottom: 1300,
          right: 400,
        }),
        viewport,
      ),
    ).toBe(false);
  });
});

describe('shouldScissorRenderPortrait', () => {
  it('requires model loaded and on-screen layout', () => {
    const onScreen = rect({ width: 400, height: 400, top: 0, left: 0, bottom: 400, right: 400 });
    expect(shouldScissorRenderPortrait({ modelLoaded: false, rect: onScreen, viewport })).toBe(
      false,
    );
    expect(shouldScissorRenderPortrait({ modelLoaded: true, rect: onScreen, viewport })).toBe(true);
  });
});

describe('shouldHideLandingFallback', () => {
  it('waits for confirmed frames', () => {
    expect(shouldHideLandingFallback(0)).toBe(false);
    expect(shouldHideLandingFallback(1)).toBe(false);
    expect(shouldHideLandingFallback(2)).toBe(true);
  });
});

describe('shouldRestoreLandingFallback', () => {
  const onScreen = rect({ width: 400, height: 400, top: 0, left: 0, bottom: 400, right: 400 });

  it('restores after grace when scissor never confirmed', () => {
    expect(
      shouldRestoreLandingFallback({
        fallbackHidden: true,
        modelLoaded: true,
        rect: onScreen,
        confirmedPortraitFrames: 0,
        framesWithoutConfirmedPortrait: 59,
        missedPortraitRenderFrames: 0,
        graceFrames: 60,
        viewport,
      }),
    ).toBe(false);
    expect(
      shouldRestoreLandingFallback({
        fallbackHidden: true,
        modelLoaded: true,
        rect: onScreen,
        confirmedPortraitFrames: 0,
        framesWithoutConfirmedPortrait: 60,
        missedPortraitRenderFrames: 0,
        graceFrames: 60,
        viewport,
      }),
    ).toBe(true);
  });

  it('restores when scissor stops after fallback was hidden', () => {
    expect(
      shouldRestoreLandingFallback({
        fallbackHidden: true,
        modelLoaded: true,
        rect: onScreen,
        confirmedPortraitFrames: 4,
        framesWithoutConfirmedPortrait: 0,
        missedPortraitRenderFrames: 60,
        graceFrames: 60,
        viewport,
      }),
    ).toBe(true);
  });

  it('does not restore while portrait frames are still drawing', () => {
    expect(
      shouldRestoreLandingFallback({
        fallbackHidden: true,
        modelLoaded: true,
        rect: onScreen,
        confirmedPortraitFrames: 4,
        framesWithoutConfirmedPortrait: 0,
        missedPortraitRenderFrames: 10,
        graceFrames: 60,
        viewport,
      }),
    ).toBe(false);
  });
});
