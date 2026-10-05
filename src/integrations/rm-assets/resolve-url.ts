/**
 * Map legacy /lqip/ URLs and markdown references to canonical public asset URLs.
 */
export function resolveCanonicalAssetUrl(url: string): string {
  let normalized = url.split('?')[0].split('#')[0];
  if (!normalized.startsWith('/assets/')) {
    return normalized;
  }
  normalized = normalized.replace('/lqip/', '/');
  return normalized;
}

/** Lookup key in manifest (no query/hash). */
export function manifestKeyFromUrl(url: string): string {
  return resolveCanonicalAssetUrl(url);
}

/** Legacy lqip-gif / lqip-webp attributes on a JPEG placeholder src. */
export function resolveContentAssetRef(src: string, hint: string): string {
  let url = resolveCanonicalAssetUrl(src);
  if (/lqip-gif/i.test(hint)) url = url.replace(/\.(jpe?g|png|webp)$/i, '.gif');
  if (/lqip-webp/i.test(hint)) url = url.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  return url;
}
