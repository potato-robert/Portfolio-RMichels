import { describe, expect, it } from 'vitest';
import { shouldSkipImgFormatWarning } from '../../audit/lib/img-format-skip.ts';

describe('shouldSkipImgFormatWarning', () => {
  const none = { lqipWebp: false, lqipGif: false, lqipIgnore: false, heroImg: false };

  it('skips LQIP placeholder paths and hero images', () => {
    expect(
      shouldSkipImgFormatWarning('/assets/img/foo/lqip/bar.jpg', none),
    ).toBe(true);
    expect(shouldSkipImgFormatWarning('/assets/img/portfolio.jpg', { ...none, heroImg: true })).toBe(
      true,
    );
  });

  it('skips progressive LQIP attribute upgrades', () => {
    expect(
      shouldSkipImgFormatWarning('/assets/img/x.jpg', { ...none, lqipWebp: true }),
    ).toBe(true);
    expect(
      shouldSkipImgFormatWarning('/assets/img/x.jpg', { ...none, lqipGif: true }),
    ).toBe(true);
    expect(
      shouldSkipImgFormatWarning('/assets/img/x.jpg', { ...none, lqipIgnore: true }),
    ).toBe(true);
  });

  it('does not skip direct content JPG/PNG', () => {
    expect(
      shouldSkipImgFormatWarning('/assets/img/tourguide/Screenshot_1.jpg', none),
    ).toBe(false);
  });
});
