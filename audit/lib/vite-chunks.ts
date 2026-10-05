import fs from 'node:fs';
import path from 'node:path';

export interface ViteChunkSize {
  file: string;
  bytes: number;
}

const THREE_CHUNK_PATTERN =
  /three|ThreeMockup|HomeWebGL|WebGLBackground|GLTFLoader|webgl|ParticleWaves|landingModel/i;

const THREE_CONTENT_SNIPPET = /from\s+["']three|THREE\.|examples\/jsm\/loaders\/GLTFLoader/;

function chunkFromPath(distDir: string, relativeFile: string): ViteChunkSize | null {
  const fullPath = path.join(distDir, relativeFile.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) return null;
  return { file: relativeFile.replace(/^\//, ''), bytes: fs.statSync(fullPath).size };
}

function collectFromManifest(distDir: string): ViteChunkSize[] {
  const manifestPath = path.join(distDir, '.vite', 'manifest.json');
  if (!fs.existsSync(manifestPath)) return [];

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<
    string,
    { file?: string; src?: string; isEntry?: boolean; imports?: string[] }
  >;

  const chunks = new Map<string, ViteChunkSize>();
  for (const entry of Object.values(manifest)) {
    const file = entry.file;
    if (!file) continue;
    const src = entry.src ?? file;
    if (!THREE_CHUNK_PATTERN.test(src) && !THREE_CHUNK_PATTERN.test(file)) continue;
    const sized = chunkFromPath(distDir, file);
    if (sized) chunks.set(sized.file, sized);
  }
  return [...chunks.values()];
}

function collectFromAstroDir(distDir: string): ViteChunkSize[] {
  const astroDir = path.join(distDir, '_astro');
  if (!fs.existsSync(astroDir)) return [];

  return fs
    .readdirSync(astroDir)
    .filter((name) => name.endsWith('.js'))
    .map((name) => {
      const file = `_astro/${name}`;
      const fullPath = path.join(astroDir, name);
      const bytes = fs.statSync(fullPath).size;
      if (THREE_CHUNK_PATTERN.test(name)) return { file, bytes };

      const head = fs.readFileSync(fullPath, 'utf8').slice(0, 8192);
      if (THREE_CONTENT_SNIPPET.test(head)) return { file, bytes };
      return null;
    })
    .filter((entry): entry is ViteChunkSize => entry !== null);
}

/** Collect built JS chunk sizes related to Three.js / WebGL islands (requires `dist/` from build). */
export function collectThreeRelatedChunkSizes(distDir: string): ViteChunkSize[] {
  const merged = new Map<string, ViteChunkSize>();
  for (const chunk of [...collectFromManifest(distDir), ...collectFromAstroDir(distDir)]) {
    merged.set(chunk.file, chunk);
  }
  return [...merged.values()].sort((a, b) => b.bytes - a.bytes);
}

export function totalBytes(chunks: ViteChunkSize[]): number {
  return chunks.reduce((sum, c) => sum + c.bytes, 0);
}
