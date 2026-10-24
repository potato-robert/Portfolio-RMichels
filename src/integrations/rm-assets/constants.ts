import path from 'node:path';

export const OPTION_VERSION = 5;

export const IMAGE_WIDTHS = [480, 800, 1200, 1600, 2400] as const;

/** Bump when GLB transform logic changes (invalidates the GLB cache only, not images). */
export const GLB_PIPELINE_VERSION = 2;

export type GlbProfile = 'generic' | 'flat-shaded-portrait';

/**
 * GLBs run through glTF-Transform at build time (source in `assets/`, output in `public/assets/`).
 * - generic: dedup, prune, texture compress, meshopt.
 * - flat-shaded-portrait: untextured, flat-shaded mesh also rendered as a dot cloud (landing model).
 *   Strips NORMAL/UV/COLOR (GLTFLoader enables flat shading when NORMAL is absent), welds
 *   duplicate corners so each dot is one vertex, then meshopt-compresses.
 */
export const GLB_PROFILES = new Map<string, GlbProfile>([
  ['models/hlAndBridgeCombined.glb', 'generic'],
  ['models/me_v2.glb', 'flat-shaded-portrait'],
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
