import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const dist = path.join(root, 'dist');
const projectsDir = path.join(root, 'src/content/projects');

export type PageTag = 'main' | 'webgl-heavy' | 'legal' | 'development';

export interface AuditPage {
  /** Path on site, e.g. `/about` or `/de/projects` */
  path: string;
  locale: 'en' | 'de';
  /** dist-relative HTML file */
  htmlRel: string;
  tags: PageTag[];
  slug?: string;
}

const WEBGL_HEAVY_SLUGS = new Set([
  'tourguide',
  'amae',
  'clirioScanViews',
  'clirioCloud',
]);

const MAIN_EXTRA_SLUGS = new Set(['futureEarth', 'tourguide']);

const LEGAL_PATHS = new Set([
  '/privacyPolicy',
  '/privacySettings',
  '/legalNotice',
  '/de/privacyPolicy',
  '/de/privacySettings',
  '/de/legalNotice',
]);

function parseFrontmatter(content: string): Record<string, string | boolean> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const fm: Record<string, string | boolean> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.+)$/);
    if (!m) continue;
    let val: string | boolean = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    } else if (val === 'true') val = true;
    else if (val === 'false') val = false;
    fm[m[1]] = val;
  }
  return fm;
}

function htmlRelToPath(htmlRel: string): string {
  const normalized = htmlRel.replace(/\\/g, '/');
  if (normalized === 'index.html') return '/';
  const withoutIndex = normalized.replace(/\/index\.html$/, '');
  return `/${withoutIndex}`;
}

function collectHtmlFiles(dir: string, base = ''): string[] {
  const files: string[] = [];
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

function parseSitemapUrls(): Set<string> {
  const urls = new Set<string>();
  const candidates = ['sitemap-index.xml', 'sitemap-0.xml'];
  for (const name of candidates) {
    const file = path.join(dist, name);
    if (!fs.existsSync(file)) continue;
    const xml = fs.readFileSync(file, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        const u = new URL(m[1]);
        urls.add(u.pathname.replace(/\/$/, '') || '/');
      } catch {
        // ignore bad URLs
      }
    }
  }
  return urls;
}

function tagPage(pagePath: string, slug: string | undefined): PageTag[] {
  const tags: PageTag[] = [];
  const isDev = pagePath.includes('/development/');
  if (isDev) tags.push('development');

  if (
    pagePath === '/' ||
    pagePath === '/de' ||
    pagePath === '/about' ||
    pagePath === '/de/about' ||
    pagePath === '/projects' ||
    pagePath === '/de/projects' ||
    (slug && MAIN_EXTRA_SLUGS.has(slug))
  ) {
    tags.push('main');
  }

  if (
    pagePath === '/' ||
    pagePath === '/de' ||
    (slug && WEBGL_HEAVY_SLUGS.has(slug))
  ) {
    tags.push('webgl-heavy');
  }

  if (LEGAL_PATHS.has(pagePath)) tags.push('legal');

  return tags;
}

export function loadPageInventory(options: {
  target: 'local' | 'prod';
  pageFilter?: string[];
  /** When true, audit every built route (legacy full-site matrix). */
  allPages?: boolean;
}): { pages: AuditPage[]; sitemapPaths: Set<string> } {
  if (!fs.existsSync(dist)) {
    throw new Error('dist/ missing — run `npm run build` before audit (local target).');
  }

  const sitemapPaths = parseSitemapUrls();
  const slugByPath = new Map<string, string>();

  if (fs.existsSync(projectsDir)) {
    for (const file of fs.readdirSync(projectsDir)) {
      if (!file.endsWith('.md')) continue;
      const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
      const fm = parseFrontmatter(content);
      if (fm.draft) continue;
      const slug = (fm.slug as string) || file.replace(/\.md$/, '');
      if (fm.inDevelopment) {
        slugByPath.set(`/development/${slug}`, slug);
        slugByPath.set(`/de/development/${slug}`, slug);
      } else {
        slugByPath.set(`/${slug}`, slug);
        slugByPath.set(`/de/${slug}`, slug);
      }
    }
  }

  const pages: AuditPage[] = [];
  for (const htmlRel of collectHtmlFiles(dist)) {
    const pagePath = htmlRelToPath(htmlRel);
    const locale: 'en' | 'de' = pagePath === '/de' || pagePath.startsWith('/de/') ? 'de' : 'en';
    const slug = slugByPath.get(pagePath);
    const tags = tagPage(pagePath, slug);

    if (options.target === 'prod' && tags.includes('development')) continue;

    pages.push({
      path: pagePath,
      locale,
      htmlRel: htmlRel.replace(/\\/g, '/'),
      tags,
      slug,
    });
  }

  pages.sort((a, b) => a.path.localeCompare(b.path));

  if (options.pageFilter?.length) {
    const filter = new Set(options.pageFilter.map((p) => (p.startsWith('/') ? p : `/${p}`)));
    return {
      pages: pages.filter((p) => filter.has(p.path)),
      sitemapPaths,
    };
  }

  const auditPages = options.allPages ? pages : pagesForDefaultAudit(pages);

  return { pages: auditPages, sitemapPaths };
}

/** DE case study sampled in the default audit set (DE routes mirror EN). */
export const DEFAULT_DE_SAMPLE_PROJECT_PATH = '/de/clirioScanViews';

/** EN webgl-heavy case study included in the default set (mockup + scroll perf coverage). */
export const DEFAULT_EN_SAMPLE_PROJECT_PATH = '/clirioScanViews';

const DEFAULT_CORE_PATHS = new Set([
  '/',
  '/about',
  '/projects',
  '/de',
  '/de/about',
  '/de/projects',
]);

function isDeCaseStudyPath(pagePath: string): boolean {
  return pagePath.startsWith('/de/') && !DEFAULT_CORE_PATHS.has(pagePath);
}

/**
 * Default audit scope: all `main`-tagged EN routes, core DE shell routes, one DE case study,
 * and one EN webgl-heavy case study. Omit with `--all-pages` or override with `--pages`.
 */
export function pagesForDefaultAudit(pages: AuditPage[]): AuditPage[] {
  return pages.filter((p) => {
    if (p.tags.includes('development')) return false;

    if (isDeCaseStudyPath(p.path)) {
      return p.path === DEFAULT_DE_SAMPLE_PROJECT_PATH;
    }

    if (p.tags.includes('main')) return true;

    if (p.path === DEFAULT_EN_SAMPLE_PROJECT_PATH) return true;

    return false;
  });
}

export function pagesForInteraction(pages: AuditPage[]): AuditPage[] {
  return pages.filter((p) => p.tags.includes('main') || p.tags.includes('webgl-heavy'));
}

/** Slugs where looping media or heavy assets prevent Playwright `networkidle`. */
const INTERACTION_LOAD_WAIT_SLUGS = new Set(['tourguide']);

export type InteractionGotoWaitUntil = 'load' | 'networkidle';

export function interactionGotoWaitUntil(page: AuditPage): InteractionGotoWaitUntil {
  if (page.slug && INTERACTION_LOAD_WAIT_SLUGS.has(page.slug)) return 'load';
  if (page.tags.includes('webgl-heavy')) return 'load';
  return 'networkidle';
}

export function readDistHtml(htmlRel: string): string {
  return fs.readFileSync(path.join(dist, ...htmlRel.split('/')), 'utf8');
}
