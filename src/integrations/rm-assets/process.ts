import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp, { type Sharp } from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import {
  dedup,
  meshopt,
  prune,
  textureCompress,
} from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import ffmpegStatic from 'ffmpeg-static';
import {
  GLB_COMPRESS_TARGETS,
  IMAGE_WIDTHS,
  OPTION_VERSION,
  RASTER_EXT,
  RM_GEN_DIR,
  SKIP_DIRS,
  normalizeAssetRel,
  repoPaths,
} from './constants.ts';
import type { AssetEntry, ImageAssetEntry, RmAssetsManifest, VideoAssetEntry } from './types.ts';

function isLfsPointer(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(64);
    fs.readSync(fd, buf, 0, 64, 0);
    fs.closeSync(fd);
    return buf.toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1');
  } catch {
    return false;
  }
}

function hashFile(filePath: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function hashString(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

async function ensureDir(dir: string) {
  await fsp.mkdir(dir, { recursive: true });
}

async function copyFile(src: string, dest: string) {
  await ensureDir(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

function publicUrl(relPath: string): string {
  const normalized = relPath.split(path.sep).join('/');
  return `/assets/${normalized}`;
}

function genBaseDir(outRoot: string, relWithoutExt: string): string {
  return path.join(outRoot, relWithoutExt, RM_GEN_DIR, path.basename(relWithoutExt));
}

async function buildPlaceholder(input: Sharp): Promise<string> {
  const buf = await input
    .clone()
    .resize(24, undefined, { withoutEnlargement: true })
    .blur(4)
    .webp({ quality: 35, effort: 2 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

async function dominantColor(input: Sharp): Promise<string> {
  const { dominant } = await input.clone().resize(8, 8, { fit: 'inside' }).stats();
  const r = Math.round(dominant.r);
  const g = Math.round(dominant.g);
  const b = Math.round(dominant.b);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function imageCacheOutputsComplete(cacheDir: string, meta: ImageAssetEntry): boolean {
  const genDir = path.join(cacheDir, 'gen');
  if (!fs.existsSync(genDir)) return false;
  const hasMaster = fs.readdirSync(cacheDir).some((f) => f.startsWith('master.'));
  if (!hasMaster) return false;
  for (const w of Object.keys(meta.avif)) {
    if (!fs.existsSync(path.join(genDir, `${w}.avif`))) return false;
  }
  for (const w of Object.keys(meta.webp)) {
    if (!fs.existsSync(path.join(genDir, `${w}.webp`))) return false;
  }
  return true;
}

async function publishImageCache(
  cacheDir: string,
  relNoExt: string,
  paths: ReturnType<typeof repoPaths>,
  meta: ImageAssetEntry,
) {
  const cachedMaster = fs.readdirSync(cacheDir).find((f) => f.startsWith('master.'));
  if (cachedMaster) {
    const masterExt = path.extname(cachedMaster);
    const canonicalMasterRel = meta.url.replace('/assets/', '').replace(/\//g, path.sep);
    const canonicalOut = path.join(paths.output, canonicalMasterRel);
    await copyFile(path.join(cacheDir, cachedMaster), canonicalOut);
    const sourceMasterRel = `${relNoExt.replace(/\//g, path.sep)}${masterExt}`;
    const sourceOut = path.join(paths.output, sourceMasterRel);
    if (path.normalize(sourceOut) !== path.normalize(canonicalOut)) {
      await copyFile(path.join(cacheDir, cachedMaster), sourceOut);
    }
  }
  const genDir = path.join(cacheDir, 'gen');
  const pubGen = genBaseDir(paths.output, relNoExt);
  if (fs.existsSync(genDir)) {
    await ensureDir(pubGen);
    for (const file of await fsp.readdir(genDir)) {
      await copyFile(path.join(genDir, file), path.join(pubGen, file));
    }
  }
}

async function processRasterImage(
  sourceAbs: string,
  relFromAssets: string,
  paths: ReturnType<typeof repoPaths>,
  entries: Record<string, AssetEntry>,
): Promise<void> {
  if (isLfsPointer(sourceAbs)) {
    console.warn(`rm-assets: skip LFS pointer ${relFromAssets}`);
    return;
  }

  const ext = path.extname(relFromAssets).toLowerCase();
  const relNoExt = relFromAssets.slice(0, -ext.length);
  const optionKey = hashString(`${OPTION_VERSION}:img:${IMAGE_WIDTHS.join(',')}`);
  const contentHash = hashFile(sourceAbs);
  const cacheKey = `${contentHash}-${optionKey}`;
  const cacheDir = path.join(paths.cache, 'outputs', cacheKey);

  let meta: ImageAssetEntry | undefined;

  const metaPath = path.join(cacheDir, 'meta.json');
  if (fs.existsSync(metaPath)) {
    const cached = JSON.parse(await fsp.readFile(metaPath, 'utf8')) as ImageAssetEntry;
    if (imageCacheOutputsComplete(cacheDir, cached)) {
      meta = cached;
      await publishImageCache(cacheDir, relNoExt, paths, meta);
    } else {
      await fsp.unlink(metaPath).catch(() => {});
    }
  }

  if (!meta) {
    const image = sharp(sourceAbs, { failOn: 'none' });
    const info = await image.metadata();
    const width = info.width ?? 0;
    const height = info.height ?? 0;
    if (width === 0 || height === 0) {
      console.warn(`rm-assets: skip unreadable image ${relFromAssets}`);
      return;
    }

    const placeholder = await buildPlaceholder(image);
    const color = await dominantColor(image);
    const widths: number[] = IMAGE_WIDTHS.filter((w) => w <= width);
    if (!widths.includes(width)) {
      widths.push(width);
    }

    const avif: ImageAssetEntry['avif'] = {};
    const webp: ImageAssetEntry['webp'] = {};
    const genDir = path.join(cacheDir, 'gen');
    await ensureDir(genDir);

    for (const w of widths) {
      const avifName = `${w}.avif`;
      const webpName = `${w}.webp`;
      await image
        .clone()
        .resize(w, undefined, { withoutEnlargement: true })
        .avif({ quality: 55, effort: 4 })
        .toFile(path.join(genDir, avifName));
      await image
        .clone()
        .resize(w, undefined, { withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(path.join(genDir, webpName));
      const avifUrl = publicUrl(
        path.join(relNoExt, RM_GEN_DIR, path.basename(relNoExt), avifName).replace(/\\/g, '/'),
      );
      const webpUrl = publicUrl(
        path.join(relNoExt, RM_GEN_DIR, path.basename(relNoExt), webpName).replace(/\\/g, '/'),
      );
      (avif as Record<number, string>)[w] = avifUrl;
      (webp as Record<number, string>)[w] = webpUrl;
    }

    let masterExt = ext;
    if (ext === '.jpeg') masterExt = '.jpg';
    if (ext !== '.png' && ext !== '.webp') masterExt = '.jpg';
    const masterRel = `${relNoExt}${masterExt}`;
    const masterOut = path.join(cacheDir, `master${masterExt}`);
    if (masterExt === '.png') {
      await image.clone().png({ compressionLevel: 9 }).toFile(masterOut);
    } else if (masterExt === '.webp') {
      await image.clone().webp({ quality: 85, effort: 4 }).toFile(masterOut);
    } else {
      await image.clone().jpeg({ quality: 85, mozjpeg: true }).toFile(masterOut);
    }

    const url = publicUrl(masterRel.replace(/\\/g, '/'));
    meta = {
      kind: 'image',
      url,
      sourceRel: relFromAssets,
      width,
      height,
      dominantColor: color,
      placeholder,
      avif,
      webp,
    };

    await fsp.writeFile(metaPath, JSON.stringify(meta, null, 2));
    await publishImageCache(cacheDir, relNoExt, paths, meta);
  }

  entries[meta.url] = meta;
  for (const alias of manifestAliasKeys(relFromAssets, meta.url)) {
    entries[alias] = meta;
  }
}

function manifestAliasKeys(relFromAssets: string, canonicalUrl: string): string[] {
  const normalized = relFromAssets.replace(/\\/g, '/');
  const aliases = new Set<string>();

  if (normalized.includes('/lqip/')) {
    aliases.add(publicUrl(normalized));
  } else {
    const parts = normalized.split('/');
    const file = parts.pop();
    if (file) {
      aliases.add(publicUrl([...parts, 'lqip', file].join('/')));
    }
  }

  aliases.add(publicUrl(normalized));
  aliases.delete(canonicalUrl);
  return [...aliases];
}

function gifCacheOutputsComplete(cacheDir: string): boolean {
  return (
    fs.existsSync(path.join(cacheDir, 'out.mp4')) &&
    fs.existsSync(path.join(cacheDir, 'out.webm')) &&
    fs.existsSync(path.join(cacheDir, 'poster.jpg'))
  );
}

async function passthroughGif(
  sourceAbs: string,
  relFromAssets: string,
  paths: ReturnType<typeof repoPaths>,
  entries: Record<string, AssetEntry>,
  reason: string,
): Promise<void> {
  console.warn(`rm-assets: GIF passthrough ${relFromAssets} (${reason})`);
  const out = path.join(paths.output, relFromAssets);
  await copyFile(sourceAbs, out);
  const url = publicUrl(relFromAssets.replace(/\\/g, '/'));
  entries[url] = {
    kind: 'passthrough',
    url,
    sourceRel: relFromAssets,
  };
}

async function processGif(
  sourceAbs: string,
  relFromAssets: string,
  paths: ReturnType<typeof repoPaths>,
  entries: Record<string, AssetEntry>,
): Promise<void> {
  if (isLfsPointer(sourceAbs)) return;

  if (!ffmpegStatic) {
    await passthroughGif(sourceAbs, relFromAssets, paths, entries, 'ffmpeg-static unavailable');
    return;
  }

  const relNoExt = relFromAssets.slice(0, -4);
  const mp4Rel = `${relNoExt}.mp4`;
  const webmRel = `${relNoExt}.webm`;
  const posterRel = `${relNoExt}.poster.jpg`;
  const cacheKey = hashFile(sourceAbs);
  const cacheDir = path.join(paths.cache, 'gif', cacheKey);
  await ensureDir(cacheDir);

  const mp4Out = path.join(cacheDir, 'out.mp4');
  const webmOut = path.join(cacheDir, 'out.webm');
  const posterOut = path.join(cacheDir, 'poster.jpg');

  if (!gifCacheOutputsComplete(cacheDir)) {
    for (const partial of ['out.mp4', 'out.webm', 'poster.jpg']) {
      const p = path.join(cacheDir, partial);
      if (fs.existsSync(p)) await fsp.unlink(p).catch(() => {});
    }

    const run = (args: string[]) => {
      const result = spawnSync(ffmpegStatic!, args, { stdio: 'pipe', encoding: 'utf8' });
      if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || 'ffmpeg failed');
      }
    };

    try {
      run([
        '-y',
        '-i',
        sourceAbs,
        '-movflags',
        'faststart',
        '-pix_fmt',
        'yuv420p',
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        mp4Out,
      ]);
      run(['-y', '-i', sourceAbs, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '35', webmOut]);
      run(['-y', '-i', sourceAbs, '-frames:v', '1', posterOut]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await passthroughGif(sourceAbs, relFromAssets, paths, entries, msg);
      return;
    }

    if (!gifCacheOutputsComplete(cacheDir)) {
      await passthroughGif(sourceAbs, relFromAssets, paths, entries, 'incomplete encode outputs');
      return;
    }
  }

  try {
    await copyFile(mp4Out, path.join(paths.output, mp4Rel));
    await copyFile(webmOut, path.join(paths.output, webmRel));
    await copyFile(posterOut, path.join(paths.output, posterRel));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await passthroughGif(sourceAbs, relFromAssets, paths, entries, `publish failed: ${msg}`);
    return;
  }

  const probe = sharp(posterOut);
  const info = await probe.metadata();
  const entry: VideoAssetEntry = {
    kind: 'video',
    url: publicUrl(mp4Rel.replace(/\\/g, '/')),
    sourceRel: relFromAssets,
    poster: publicUrl(posterRel.replace(/\\/g, '/')),
    webm: publicUrl(webmRel.replace(/\\/g, '/')),
    width: info.width ?? 0,
    height: info.height ?? 0,
  };
  entries[entry.url] = entry;
  const relPosix = relFromAssets.replace(/\\/g, '/');
  const relNoExtPosix = relPosix.slice(0, -4);
  entries[publicUrl(relPosix)] = entry;
  entries[publicUrl(`${relNoExtPosix}.jpg`)] = entry;
  const parts = relNoExtPosix.split('/');
  const fileBase = parts.pop() ?? '';
  entries[publicUrl([...parts, 'lqip', `${fileBase}.jpg`].join('/'))] = entry;
}

async function processGlb(
  sourceAbs: string,
  relFromAssets: string,
  paths: ReturnType<typeof repoPaths>,
): Promise<void> {
  const outPath = path.join(paths.output, relFromAssets);
  if (!GLB_COMPRESS_TARGETS.has(relFromAssets.replace(/\\/g, '/'))) {
    await copyFile(sourceAbs, outPath);
    return;
  }

  if (isLfsPointer(sourceAbs)) {
    await copyFile(sourceAbs, outPath);
    return;
  }

  const contentHash = hashFile(sourceAbs);
  const cachePath = path.join(paths.cache, 'glb', `${contentHash}.glb`);

  if (!fs.existsSync(cachePath)) {
    await MeshoptEncoder.ready;
    const io = new NodeIO();
    const document = await io.read(sourceAbs);
    await document.transform(
      dedup(),
      prune(),
      textureCompress({ targetFormat: 'webp', resize: [2048, 2048] }),
      meshopt({ encoder: MeshoptEncoder, level: 'high' }),
    );
    await ensureDir(path.dirname(cachePath));
    await io.write(cachePath, document);
  }

  await copyFile(cachePath, outPath);
}

async function walkSources(dir: string, base = ''): Promise<string[]> {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of await fsp.readdir(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = path.join(dir, name);
    const rel = normalizeAssetRel(base ? `${base}/${name}` : name);
    const st = await fsp.stat(abs);
    if (st.isDirectory()) {
      out.push(...(await walkSources(abs, rel)));
    } else {
      out.push(rel);
    }
  }
  return out;
}

export async function processRmAssets(root = process.cwd()): Promise<RmAssetsManifest> {
  const paths = repoPaths(root);
  if (!fs.existsSync(paths.sources)) {
    throw new Error(`rm-assets: missing sources at ${paths.sources}`);
  }

  await ensureDir(paths.cache);
  await ensureDir(paths.output);

  const entries: Record<string, AssetEntry> = {};
  const relFiles = await walkSources(paths.sources);

  const tasks: Array<() => Promise<void>> = [];
  const gifTasks: Array<() => Promise<void>> = [];

  for (const rel of relFiles) {
    const abs = path.join(paths.sources, rel);
    const ext = path.extname(rel).toLowerCase();

    if (ext === '.gif') {
      gifTasks.push(() => processGif(abs, rel, paths, entries));
      continue;
    }

    if (ext === '.glb') {
      tasks.push(async () => {
        await processGlb(abs, rel, paths);
        entries[publicUrl(rel.replace(/\\/g, '/'))] = {
          kind: 'passthrough',
          url: publicUrl(rel.replace(/\\/g, '/')),
          sourceRel: rel,
        };
      });
      continue;
    }

    if (RASTER_EXT.has(ext)) {
      tasks.push(() => processRasterImage(abs, rel, paths, entries));
      continue;
    }

    tasks.push(async () => {
      const out = path.join(paths.output, rel);
      await copyFile(abs, out);
      entries[publicUrl(rel.replace(/\\/g, '/'))] = {
        kind: 'passthrough',
        url: publicUrl(rel.replace(/\\/g, '/')),
        sourceRel: rel,
      };
    });
  }

  const concurrency = 4;
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  for (const gifTask of gifTasks) {
    await gifTask();
  }

  const manifest: RmAssetsManifest = {
    version: 1,
    optionVersion: OPTION_VERSION,
    generatedAt: new Date().toISOString(),
    entries,
  };

  await fsp.writeFile(paths.manifest, JSON.stringify(manifest, null, 2));
  return manifest;
}
