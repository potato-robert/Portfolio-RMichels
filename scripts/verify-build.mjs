#!/usr/bin/env node
/**
 * Post-build verification — run after `npm run build`.
 * Confirms expected routes exist in dist/ and no forbidden paths were emitted.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const projectsDir = path.join(root, 'src/content/projects');

const errors = [];

function requirePath(relPath) {
  const full = path.join(dist, ...relPath.split('/'));
  if (!fs.existsSync(full)) {
    errors.push(relPath);
  }
}

function assertNotLfsPointer(relPath) {
  const full = path.join(dist, ...relPath.split('/'));
  if (!fs.existsSync(full)) {
    errors.push(relPath);
    return;
  }
  const head = fs.readFileSync(full, 'utf8').slice(0, 40);
  if (head.startsWith('version https://git-lfs.github.com/spec/v1')) {
    errors.push(`LFS pointer (run git lfs pull): ${relPath}`);
  }
}

function forbidPath(relPath) {
  const full = path.join(dist, ...relPath.split('/'));
  if (fs.existsSync(full)) {
    errors.push(`must not exist: ${relPath}`);
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const fm = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.+)$/);
    if (!m) continue;

    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    } else if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }

    fm[m[1]] = val;
  }
  return fm;
}

function getProjectSlugsByRouting() {
  /** @type {{ published: string[], inDevelopment: string[] }} */
  const result = { published: [], inDevelopment: [] };

  if (!fs.existsSync(projectsDir)) {
    errors.push('src/content/projects/ (content source missing)');
    return result;
  }

  for (const file of fs.readdirSync(projectsDir)) {
    if (!file.endsWith('.md')) continue;

    const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
    const fm = parseFrontmatter(content);

    if (fm.draft) continue;

    const slug = fm.slug || file.replace(/\.md$/, '');
    if (fm.inDevelopment) {
      result.inDevelopment.push(slug);
    } else {
      result.published.push(slug);
    }
  }

  result.published.sort();
  result.inDevelopment.sort();
  return result;
}

/**
 * Accidental Shiki plaintext blocks mean raw HTML was parsed as markdown code.
 * @param {string} slug
 */
function checkProjectHtmlRendering(slug) {
  for (const localePrefix of ['', 'de/']) {
    const relPath = `${localePrefix}${slug}/index.html`;
    const full = path.join(dist, ...relPath.split('/'));
    if (!fs.existsSync(full)) continue;

    const html = fs.readFileSync(full, 'utf8');
    const brokenCount = (html.match(/data-language="plaintext"/g) ?? []).length;
    if (brokenCount > 0) {
      errors.push(
        `${relPath} has ${brokenCount} accidental HTML code block(s) (data-language="plaintext")`,
      );
    }
  }
}

if (!fs.existsSync(dist)) {
  console.error('verify-build: dist/ does not exist — run `npm run build` first');
  process.exit(1);
}

const requiredPaths = [
  'index.html',
  'projects/index.html',
  'about/index.html',
  'privacyPolicy/index.html',
  'privacySettings/index.html',
  'legalNotice/index.html',
  'futureEarth/index.html',
  'de/index.html',
  'de/projects/index.html',
  'de/privacyPolicy/index.html',
  'de/privacySettings/index.html',
  'de/legalNotice/index.html',
  'de/futureEarth/index.html',
];

for (const relPath of requiredPaths) {
  requirePath(relPath);
}

const hasSitemap =
  fs.existsSync(path.join(dist, 'sitemap-index.xml')) ||
  fs.existsSync(path.join(dist, 'sitemap-0.xml'));

if (!hasSitemap) {
  errors.push('sitemap-index.xml or sitemap-0.xml');
}

const lfsCheckedAssets = [
  'assets/img/portrait.jpg',
  'assets/img/portfolio.jpg',
  'assets/img/futureEarth.jpg',
];
for (const assetPath of lfsCheckedAssets) {
  assertNotLfsPointer(assetPath);
}

const { published: publishedSlugs, inDevelopment: inDevelopmentSlugs } =
  getProjectSlugsByRouting();

for (const slug of publishedSlugs) {
  requirePath(`${slug}/index.html`);
  requirePath(`de/${slug}/index.html`);
  checkProjectHtmlRendering(slug);
}

for (const slug of inDevelopmentSlugs) {
  requirePath(`development/${slug}/index.html`);
  requirePath(`de/development/${slug}/index.html`);
  forbidPath(`${slug}/index.html`);
  forbidPath(`de/${slug}/index.html`);
  checkProjectHtmlRendering(slug);
}

const ALLOWED_THIRD_PARTY_SCRIPT_HOSTS = new Set(['cloud.umami.is']);

function collectHtmlFiles(dir, base = '') {
  /** @type {string[]} */
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(full, rel));
    } else if (entry.name.endsWith('.html')) {
      files.push(rel);
    }
  }
  return files;
}

function checkNoRawThirdPartyEmbeds(relPath) {
  const full = path.join(dist, ...relPath.split('/'));
  const html = fs.readFileSync(full, 'utf8');

  const iframeSrcRe = /<iframe[^>]+src\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
  for (const match of html.matchAll(iframeSrcRe)) {
    errors.push(`${relPath}: raw third-party iframe src ${match[1]}`);
  }

  const scriptSrcRe = /<script[^>]+src\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
  for (const match of html.matchAll(scriptSrcRe)) {
    try {
      const host = new URL(match[1]).hostname;
      if (!ALLOWED_THIRD_PARTY_SCRIPT_HOSTS.has(host)) {
        errors.push(`${relPath}: unexpected third-party script src ${match[1]}`);
      }
    } catch {
      errors.push(`${relPath}: invalid script src ${match[1]}`);
    }
  }
}

for (const relPath of collectHtmlFiles(dist)) {
  checkNoRawThirdPartyEmbeds(relPath);
}

function checkResponsiveImages(relPath) {
  const full = path.join(dist, ...relPath.split('/'));
  const html = fs.readFileSync(full, 'utf8');

  const imgTagRe = /<img\b[^>]*>/gi;
  for (const tag of html.matchAll(imgTagRe)) {
    const fragment = tag[0];
    if (/lqip-ignore/i.test(fragment)) continue;
    if (/lqip-gif/i.test(fragment) || /lqip-webp/i.test(fragment)) {
      errors.push(`${relPath}: legacy lqip img not transformed: ${fragment.slice(0, 80)}…`);
      continue;
    }
    if (!/\ssrc=["']\/assets\//i.test(fragment)) continue;
    if (!/\swidth=["'][0-9]+["']/i.test(fragment)) {
      errors.push(`${relPath}: img missing width (${fragment.slice(0, 80)}…)`);
    }
    if (!/\sheight=["'][0-9]+["']/i.test(fragment)) {
      errors.push(`${relPath}: img missing height (${fragment.slice(0, 80)}…)`);
    }
  }

  const srcsetRe = /srcset=["']([^"']+)["']/gi;
  for (const match of html.matchAll(srcsetRe)) {
    const parts = match[1].split(',').map((p) => p.trim().split(/\s+/)[0]);
    for (const url of parts) {
      if (!url.startsWith('/assets/')) continue;
      const assetPath = url.replace(/^\//, '');
      const file = path.join(dist, assetPath);
      if (!fs.existsSync(file)) {
        errors.push(`${relPath}: srcset URL missing in dist: ${url}`);
      }
    }
  }
}

for (const relPath of collectHtmlFiles(dist)) {
  checkResponsiveImages(relPath);
}

if (errors.length > 0) {
  console.error('verify-build: missing or invalid paths in dist/:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

const devNote =
  inDevelopmentSlugs.length > 0
    ? `, ${inDevelopmentSlugs.length} in-development slug(s) EN+DE`
    : '';

console.log(
  `verify-build: OK (${requiredPaths.length} core routes, ${publishedSlugs.length} published project slugs EN+DE${devNote}, sitemap present)`,
);
