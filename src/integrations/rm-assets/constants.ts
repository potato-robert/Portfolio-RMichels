import path from 'node:path';

export const OPTION_VERSION = 4;

export const IMAGE_WIDTHS = [480, 800, 1200, 1600, 2400] as const;

export const GLB_COMPRESS_TARGETS = new Set([
  'models/hlAndBridgeCombined.glb',
  'models/me_v2.glb',
]);

export const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** Generated responsive variants (public URL segment; no leading dot — static servers hide dot dirs). */
export const RM_GEN_DIR = '_rm-gen';

export const SKIP_DIRS = new Set(['lqip', RM_GEN_DIR]);

/** Canonical path casing for URLs (Windows readdir may return lowercase folder names). */
export function normalizeAssetRel(rel: string): string {
  const p = rel.replace(/\\/g, '/');
  return p
    .replace(/^img\/futureearth(\/|$)/i, 'img/futureEarth$1')
    .replace(/^img\/harbingersofdeath(\/|$)/i, 'img/harbingersOfDeath$1');
}

export function repoPaths(root: string) {
  return {
    root,
    sources: path.join(root, 'assets'),
    output: path.join(root, 'public', 'assets'),
    cache: path.join(root, 'node_modules', '.cache', 'rm-assets'),
    manifest: path.join(root, 'node_modules', '.cache', 'rm-assets', 'manifest.json'),
    cacheIndex: path.join(root, 'node_modules', '.cache', 'rm-assets', 'index.json'),
  };
}
