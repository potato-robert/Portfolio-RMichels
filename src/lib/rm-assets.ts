import fs from 'node:fs';
import { repoPaths } from '../integrations/rm-assets/constants.ts';
import { manifestKeyFromUrl, resolveCanonicalAssetUrl } from '../integrations/rm-assets/resolve-url.ts';
import type { AssetEntry, ImageAssetEntry, RmAssetsManifest } from '../integrations/rm-assets/types.ts';

export { resolveCanonicalAssetUrl, manifestKeyFromUrl };

/** Read manifest from disk (works in astro.config, rehype, and .astro SFCs). */
export function readRmAssetsManifest(root = process.cwd()): RmAssetsManifest {
  const { manifest } = repoPaths(root);
  if (!fs.existsSync(manifest)) {
    throw new Error(`rm-assets manifest missing at ${manifest} — run npm run rm-assets`);
  }
  return JSON.parse(fs.readFileSync(manifest, 'utf8')) as RmAssetsManifest;
}

export function getAssetEntryFromManifest(
  manifest: RmAssetsManifest,
  src: string,
): AssetEntry | undefined {
  return manifest.entries[manifestKeyFromUrl(src)];
}

export function getImageEntryFromManifest(
  manifest: RmAssetsManifest,
  src: string,
): ImageAssetEntry | undefined {
  const entry = getAssetEntryFromManifest(manifest, src);
  return entry?.kind === 'image' ? entry : undefined;
}

let manifestCache: RmAssetsManifest | null = null;

export function loadRmAssetsManifest(): RmAssetsManifest {
  manifestCache ??= readRmAssetsManifest();
  return manifestCache;
}

export function getAssetEntry(src: string): AssetEntry | undefined {
  return getAssetEntryFromManifest(loadRmAssetsManifest(), src);
}

export function getImageEntry(src: string): ImageAssetEntry | undefined {
  return getImageEntryFromManifest(loadRmAssetsManifest(), src);
}

export function buildSrcset(variants: Partial<Record<number, string>>): string {
  return Object.entries(variants)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([w, url]) => `${url} ${w}w`)
    .join(', ');
}

export function heroImageExists(slug: string): boolean {
  return Boolean(getImageEntry(`/assets/img/${slug}.jpg`));
}
