/** Progressive LQIP and hero JPGs are intentional; skip img-format SEO warnings. */
export function shouldSkipImgFormatWarning(
  src: string,
  attrs: { lqipWebp: boolean; lqipGif: boolean; lqipIgnore: boolean; heroImg: boolean },
): boolean {
  if (attrs.lqipIgnore || attrs.lqipWebp || attrs.lqipGif) return true;
  if (attrs.heroImg) return true;
  if (/\/lqip\//i.test(src)) return true;
  return false;
}
