#!/usr/bin/env node
/**
 * Pre-build content validation for Astro portfolio.
 * Exit code 1 on failure; emits JSON lines { slug, field, error } per issue.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';
import { projectSchema, PARITY_FIELDS } from './content-schema.mjs';
import {
  findHtmlBlankLineIssues,
  splitProjectMarkdown,
} from './project-markdown-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const PROJECTS_EN = path.join(root, 'src/content/projects');
const PROJECTS_DE = path.join(root, 'src/content/projects-de');
const ROLES_TS = path.join(root, 'src/lib/roles.ts');
const UI_EN = path.join(root, 'src/i18n/ui-en.json');
const UI_DE = path.join(root, 'src/i18n/ui-de.json');
/** Tracked masters (Git LFS); rm-assets generates public/assets at build time. */
function resolveSourceAssetDir(...parts) {
  return path.join(root, 'assets', ...parts);
}

const IMG_DIR = resolveSourceAssetDir('img');
const MODELS_DIR = resolveSourceAssetDir('models');
const MANIFEST_PATH = path.join(root, 'node_modules', '.cache', 'rm-assets', 'manifest.json');
const MAX_MASTER_BYTES = 8 * 1024 * 1024;

function resolveCanonicalAssetUrl(url) {
  let normalized = url.split('?')[0].split('#')[0];
  if (!normalized.startsWith('/assets/')) return normalized;
  return normalized.replace('/lqip/', '/');
}

/** @param {string} ref */
function manifestLookupKeys(ref) {
  const keys = new Set([ref]);
  const canonical = resolveCanonicalAssetUrl(ref);
  keys.add(canonical);
  keys.add(canonical.replace(/\.(jpe?g|png|webp)$/i, '.gif'));
  keys.add(canonical.replace(/\.gif$/i, '.jpg'));
  return keys;
}

/** @param {{ entries?: Record<string, unknown> }} manifest @param {string} ref */
function manifestHasEntry(manifest, ref) {
  for (const key of manifestLookupKeys(ref)) {
    if (manifest.entries?.[key]) return true;
  }
  return false;
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    fail('_manifest', 'manifest', `missing ${MANIFEST_PATH} — run npm run rm-assets first`);
    return { entries: {} };
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

/**
 * @param {string} src
 * @param {string} tag
 */
function resolveContentAssetRef(src, tag) {
  let url = resolveCanonicalAssetUrl(src);
  if (/lqip-gif/i.test(tag)) url = url.replace(/\.(jpe?g|png|webp)$/i, '.gif');
  if (/lqip-webp/i.test(tag)) url = url.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  return url;
}
// keep in sync with src/integrations/rm-assets/resolve-url.ts

/** @param {string} content */
function extractAssetRefs(content) {
  /** @type {Set<string>} */
  const refs = new Set();
  const imgRe = /<img\b[^>]*>/gi;
  for (const tag of content.matchAll(imgRe)) {
    const srcMatch = tag[0].match(/\ssrc=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    refs.add(resolveContentAssetRef(srcMatch[1], tag[0]));
  }
  const re = /\/assets\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp|gif|mp4|webm|glb)/gi;
  for (const match of content.matchAll(re)) {
    refs.add(resolveCanonicalAssetUrl(match[0]));
  }
  return refs;
}

const THREE_MOCKUP_ASSETS = {
  phone: 'phone.glb',
  hololens: 'hlAndBridgeCombined.glb',
};

/** @type {{ slug: string, field: string, error: string }[]} */
const errors = [];

/**
 * @param {string} slug
 * @param {string} field
 * @param {string} error
 */
function fail(slug, field, error) {
  const entry = { slug, field, error };
  errors.push(entry);
  console.log(JSON.stringify(entry));
}

/**
 * Case-sensitive existence check (Linux deploy / CI safe).
 * @param {string} dir
 * @param {string} filename
 */
function fileExistsExact(dir, filename) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).includes(filename);
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function listMarkdownBasenames(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort();
}

/**
 * @param {string} content
 * @returns {Record<string, unknown> | null}
 */
function parseFrontmatterObject(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  try {
    return yamlLoad(match[1]);
  } catch (err) {
    return null;
  }
}

/**
 * @param {string} filePath
 * @param {string} slug
 */
function checkMarkdownHtmlBlankLines(filePath, slug) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { body, bodyStartLine } = splitProjectMarkdown(content);
  const issues = findHtmlBlankLineIssues(body);

  for (const bodyLine of issues) {
    fail(
      slug,
      'body',
      `blank line inside HTML block at line ${bodyStartLine + bodyLine - 1} in ${path.basename(filePath)} — remove it or content may render as a code block`,
    );
  }
}

/**
 * @param {string} filePath
 * @returns {{ basename: string, slug: string, data: Record<string, unknown>, parseError?: string }}
 */
function loadProjectData(filePath) {
  const basename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = parseFrontmatterObject(content);
  const filenameSlug = basename.replace(/\.md$/i, '');

  if (!data || typeof data !== 'object') {
    return {
      basename,
      slug: filenameSlug,
      data: {},
      parseError: 'invalid or missing YAML frontmatter',
    };
  }

  const slug = typeof data.slug === 'string' ? data.slug : filenameSlug;
  return { basename, slug, data };
}

/**
 * @param {Record<string, unknown>} data
 * @param {string} slug
 */
function validateSchema(data, slug) {
  const result = projectSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      fail(slug, issue.path.join('.') || 'frontmatter', issue.message);
    }
    return false;
  }
  return true;
}

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function normalizeForParity(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeForParity);
  }
  if (value && typeof value === 'object') {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = normalizeForParity(/** @type {Record<string, unknown>} */ (value)[key]);
    }
    return out;
  }
  return value;
}

/**
 * @param {Record<string, unknown>} enData
 * @param {Record<string, unknown>} deData
 * @param {string} slug
 */
function checkFrontmatterParity(enData, deData, slug) {
  for (const field of PARITY_FIELDS) {
    const enVal = normalizeForParity(enData[field]);
    const deVal = normalizeForParity(deData[field]);
    const enJson = JSON.stringify(enVal);
    const deJson = JSON.stringify(deVal);
    if (enJson !== deJson) {
      fail(slug, field, `EN/DE frontmatter mismatch for "${field}"`);
    }
  }
}

/**
 * @returns {Set<string>}
 */
function loadRoleSlugs() {
  const source = fs.readFileSync(ROLES_TS, 'utf8');
  const slugs = new Set();
  const re = /slug:\s*'([^']+)'/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    slugs.add(match[1]);
  }
  return slugs;
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} [prefix]
 * @returns {string[]}
 */
function collectJsonKeys(obj, prefix = '') {
  /** @type {string[]} */
  const keys = [];
  for (const key of Object.keys(obj).sort()) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectJsonKeys(/** @type {Record<string, unknown>} */ (value), fullKey));
    }
  }
  return keys;
}

function checkEnDeParity() {
  const enFiles = listMarkdownBasenames(PROJECTS_EN);
  const deFiles = listMarkdownBasenames(PROJECTS_DE);
  const enSet = new Set(enFiles);
  const deSet = new Set(deFiles);

  for (const file of enFiles) {
    if (!deSet.has(file)) {
      fail(file.replace(/\.md$/i, ''), 'locale', `missing DE counterpart: ${file}`);
    }
  }

  for (const file of deFiles) {
    if (!enSet.has(file)) {
      fail(file.replace(/\.md$/i, ''), 'locale', `missing EN counterpart: ${file}`);
    }
  }
}

function checkManifestReferences(manifest, projectsBySlug) {
  for (const [slug, meta] of projectsBySlug) {
    if (meta.draft) continue;
    for (const filePath of [path.join(PROJECTS_EN, `${slug}.md`), path.join(PROJECTS_DE, `${slug}.md`)]) {
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf8');
      for (const ref of extractAssetRefs(content)) {
        if (!manifestHasEntry(manifest, ref)) {
          fail(slug, 'body', `asset not in rm-assets manifest: ${ref}`);
        }
      }
    }
  }
}

function warnLargeMasters() {
  /** @param {string} dir */
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        if (name === 'lqip' || name === '_rm-gen') continue;
        walk(full);
        continue;
      }
      if (!/\.(jpe?g|png|webp|gif)$/i.test(name)) continue;
      if (st.size > MAX_MASTER_BYTES) {
        const rel = path.relative(path.join(root, 'assets'), full).replace(/\\/g, '/');
        console.log(
          JSON.stringify({
            slug: '_assets',
            field: rel,
            error: `warning: master exceeds 8MB (${Math.round(st.size / (1024 * 1024))}MB)`,
          }),
        );
      }
    }
  }
  walk(path.join(root, 'assets', 'img'));
}

function checkProjects() {
  const roleSlugs = loadRoleSlugs();
  const enFiles = listMarkdownBasenames(PROJECTS_EN).map((name) => path.join(PROJECTS_EN, name));
  const deByBasename = new Map(
    listMarkdownBasenames(PROJECTS_DE).map((name) => [name, path.join(PROJECTS_DE, name)]),
  );
  /** @type {Map<string, { slug: string, inDevelopment: boolean, draft: boolean, threeMockup?: string | null }>} */
  const projectsBySlug = new Map();

  for (const filePath of enFiles) {
    const project = loadProjectData(filePath);
    const filenameSlug = project.basename.replace(/\.md$/i, '');

    if (project.parseError) {
      fail(filenameSlug, 'frontmatter', project.parseError);
      continue;
    }

    if (project.slug !== filenameSlug) {
      fail(filenameSlug, 'slug', `frontmatter slug "${project.slug}" does not match filename "${filenameSlug}"`);
    }

    validateSchema(project.data, project.slug);
    checkMarkdownHtmlBlankLines(filePath, project.slug);

    const dePath = deByBasename.get(project.basename);
    if (dePath) {
      const deProject = loadProjectData(dePath);
      if (deProject.parseError) {
        fail(filenameSlug, 'frontmatter', `DE ${deProject.parseError}`);
      } else {
        checkFrontmatterParity(project.data, deProject.data, project.slug);
        checkMarkdownHtmlBlankLines(dePath, project.slug);
      }
    }

    const roles = Array.isArray(project.data.roles) ? project.data.roles : [];
    for (const role of roles) {
      if (typeof role === 'string' && !roleSlugs.has(role)) {
        fail(project.slug, 'roles', `unknown role "${role}"`);
      }
    }

    const draft = project.data.draft === true;
    const inDevelopment = project.data.inDevelopment === true;
    const threeMockup = project.data.threeMockup;

    if (!draft) {
      const heroName = `${project.slug}.jpg`;
      if (!fileExistsExact(IMG_DIR, heroName)) {
        fail(project.slug, 'heroImage', `missing master: assets/img/${heroName}`);
      }
    }

    if (threeMockup) {
      const assetName = THREE_MOCKUP_ASSETS[/** @type {keyof typeof THREE_MOCKUP_ASSETS} */ (threeMockup)];
      if (!assetName) {
        fail(project.slug, 'threeMockup', `unknown threeMockup value "${threeMockup}"`);
      } else if (!fileExistsExact(MODELS_DIR, assetName)) {
        fail(project.slug, 'threeMockup', `missing model: assets/models/${assetName}`);
      }
    }

    projectsBySlug.set(project.slug, { slug: project.slug, inDevelopment, draft, threeMockup });
  }

  return projectsBySlug;
}

/**
 * @param {Map<string, { slug: string, inDevelopment: boolean, draft: boolean }>} projectsBySlug
 */
function checkInDevelopmentRouting(projectsBySlug) {
  for (const [slug, meta] of projectsBySlug) {
    if (meta.draft && meta.inDevelopment) {
      fail(
        slug,
        'inDevelopment',
        'draft and inDevelopment are both set — no /slug or /development/{slug} route will be generated',
      );
    }
  }
}

function checkUiKeyParity() {
  const en = JSON.parse(fs.readFileSync(UI_EN, 'utf8'));
  const de = JSON.parse(fs.readFileSync(UI_DE, 'utf8'));
  const enKeys = new Set(collectJsonKeys(en));
  const deKeys = new Set(collectJsonKeys(de));

  for (const key of enKeys) {
    if (!deKeys.has(key)) {
      fail('i18n', key, `missing in ui-de.json`);
    }
  }

  for (const key of deKeys) {
    if (!enKeys.has(key)) {
      fail('i18n', key, `missing in ui-en.json`);
    }
  }
}

function main() {
  checkEnDeParity();
  const projectsBySlug = checkProjects();
  const manifest = loadManifest();
  checkManifestReferences(manifest, projectsBySlug);
  warnLargeMasters();
  checkInDevelopmentRouting(projectsBySlug);
  checkUiKeyParity();

  console.log(`\nSummary: ${errors.length} error(s)`);
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
