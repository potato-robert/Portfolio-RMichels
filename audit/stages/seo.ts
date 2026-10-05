import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseHtml } from 'node-html-parser';
import { LinkChecker } from 'linkinator';
import { shouldSkipLinkCheckUrl } from '../config/link-check-skip.ts';
import { shouldSkipImgFormatWarning } from '../lib/img-format-skip.ts';
import { readDistHtml, type AuditPage } from '../config/pages.ts';
import { SEO_DESC_LEN, SEO_TITLE_LEN } from '../config/budgets.ts';
import { isAuditAborted, throwIfAborted } from '../lib/abort.ts';
import type { LighthousePageMedian } from './lighthouse.ts';

const distRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist');

export type SeoSeverity = 'error' | 'warning';

export interface SeoFinding {
  page: string;
  rule: string;
  severity: SeoSeverity;
  detail: string;
}

export interface SeoStageResult {
  findings: SeoFinding[];
  linkCheck?: { passed: boolean; failures: string[] };
}

function absCanonical(base: string, pagePath: string): string {
  const pathPart = pagePath === '/' ? '' : pagePath;
  return `${base.replace(/\/$/, '')}${pathPart}/`.replace(/([^:]\/)\/+/g, '$1');
}

function expectedJsonLdTypes(page: AuditPage): string[] {
  if (page.path === '/' || page.path === '/de') return ['WebSite', 'Person'];
  if (page.path === '/about' || page.path === '/de/about') return ['ProfilePage', 'Person'];
  if (page.slug && !page.tags.includes('development')) return ['CreativeWork'];
  return [];
}

function parseJsonLd(html: string, pagePath: string, findings: SeoFinding[]): unknown[] {
  const scripts = parseHtml(html).querySelectorAll('script[type="application/ld+json"]');
  const out: unknown[] = [];
  for (let i = 0; i < scripts.length; i++) {
    const raw = scripts[i]!.textContent.trim();
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      findings.push({
        page: pagePath,
        rule: 'json-ld-parse-error',
        severity: 'error',
        detail: `block ${i + 1}: ${msg}`,
      });
    }
  }
  return out;
}

function readImageDimensions(filePath: string): { width: number; height: number } | null {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker === 0xc0 || marker === 0xc2) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return null;
}

function distAssetPath(url: string): string | null {
  if (!url || /^https?:\/\//i.test(url)) return null;
  const rel = url.replace(/^\//, '').split('?')[0]!;
  return path.join(distRoot, rel);
}

function checkHeadingOrder(doc: ReturnType<typeof parseHtml>, pagePath: string, findings: SeoFinding[]) {
  const headings = doc.querySelectorAll('h1,h2,h3,h4,h5,h6');
  let lastLevel = 0;
  for (const h of headings) {
    const level = Number(h.tagName.replace('H', ''));
    if (lastLevel && level > lastLevel + 1) {
      findings.push({
        page: pagePath,
        rule: 'heading-order',
        severity: 'warning',
        detail: `skipped heading level h${lastLevel} → h${level}`,
      });
      break;
    }
    lastLevel = level;
  }
}

function hreflangRowsFromDist(pagePath: string): Array<{ hreflang: string; href: string }> | undefined {
  const normalized = pagePath === '' ? '/' : pagePath;
  let htmlRel: string | undefined;
  if (normalized === '/') {
    htmlRel = 'index.html';
  } else {
    const rel = normalized.replace(/^\//, '');
    const nested = path.join(distRoot, rel, 'index.html');
    const flat = path.join(distRoot, `${rel}.html`);
    if (fs.existsSync(nested)) htmlRel = `${rel}/index.html`.replace(/\\/g, '/');
    else if (fs.existsSync(flat)) htmlRel = `${rel}.html`.replace(/\\/g, '/');
  }
  if (!htmlRel || !fs.existsSync(path.join(distRoot, ...htmlRel.split('/')))) return undefined;

  const doc = parseHtml(readDistHtml(htmlRel));
  const links = doc.querySelectorAll('link[rel="alternate"][hreflang]');
  const rows: Array<{ hreflang: string; href: string }> = [];
  for (const link of links) {
    const hreflang = link.getAttribute('hreflang')?.trim() ?? '';
    const href = link.getAttribute('href')?.trim() ?? '';
    if (hreflang && href) rows.push({ hreflang, href });
  }
  return rows;
}

function hreflangRowsForPath(
  pagePath: string,
  alts: Map<string, Array<{ hreflang: string; href: string }>>,
): Array<{ hreflang: string; href: string }> | undefined {
  const key = pagePath === '' ? '/' : pagePath;
  const cached = alts.get(key);
  if (cached) return cached;
  const fromDist = hreflangRowsFromDist(key);
  if (fromDist) alts.set(key, fromDist);
  return fromDist;
}

function checkHreflangReciprocity(pages: AuditPage[], findings: SeoFinding[]) {
  const alts = new Map<string, Array<{ hreflang: string; href: string }>>();
  for (const page of pages) {
    const doc = parseHtml(readDistHtml(page.htmlRel));
    const links = doc.querySelectorAll('link[rel="alternate"][hreflang]');
    const rows: Array<{ hreflang: string; href: string }> = [];
    for (const link of links) {
      const hreflang = link.getAttribute('hreflang')?.trim() ?? '';
      const href = link.getAttribute('href')?.trim() ?? '';
      if (hreflang && href) rows.push({ hreflang, href });
    }
    alts.set(page.path, rows);
  }

  let hasDefault = false;
  for (const rows of alts.values()) {
    if (rows.some((r) => r.hreflang === 'x-default')) hasDefault = true;
  }
  if (!hasDefault) {
    findings.push({
      page: '/',
      rule: 'hreflang-x-default',
      severity: 'error',
      detail: 'no x-default hreflang link found across audited pages',
    });
  }

  for (const [pagePath, rows] of alts) {
    for (const row of rows) {
      if (row.hreflang === 'x-default') continue;
      const targetPath = new URL(row.href).pathname.replace(/\/$/, '') || '/';
      const reverse = hreflangRowsForPath(targetPath === '' ? '/' : targetPath, alts);
      const back = reverse?.find((r) => r.href.includes(pagePath.replace(/^\//, '')));
      if (!back) {
        findings.push({
          page: pagePath,
          rule: 'hreflang-reciprocity',
          severity: 'error',
          detail: `missing reciprocal hreflang for ${row.hreflang} → ${row.href}`,
        });
      }
    }
  }
}

function checkRobotsTxt(findings: SeoFinding[]) {
  const robotsPath = path.join(distRoot, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    findings.push({
      page: '(site)',
      rule: 'robots-txt',
      severity: 'error',
      detail: 'dist/robots.txt missing',
    });
    return;
  }
  const text = fs.readFileSync(robotsPath, 'utf8');
  if (!/sitemap:/i.test(text)) {
    findings.push({
      page: '(site)',
      rule: 'robots-sitemap',
      severity: 'warning',
      detail: 'robots.txt does not reference a sitemap',
    });
  }
}

export function mergeLighthouseAuditFindings(
  findings: SeoFinding[],
  lhPages: LighthousePageMedian[] | undefined,
): SeoFinding[] {
  if (!lhPages?.length) return findings;
  const merged = [...findings];
  for (const row of lhPages) {
    for (const id of row.failedAudits?.seo ?? []) {
      merged.push({
        page: row.page,
        rule: `lighthouse-seo-${id}`,
        severity: 'error',
        detail: `Lighthouse SEO audit failed (${row.preset}): ${id}`,
      });
    }
    for (const id of row.failedAudits?.accessibility ?? []) {
      merged.push({
        page: row.page,
        rule: `lighthouse-a11y-${id}`,
        severity: 'error',
        detail: `Lighthouse accessibility audit failed (${row.preset}): ${id}`,
      });
    }
  }
  return merged;
}

function jsonLdHasType(blocks: unknown[], type: string): boolean {
  const walk = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(walk);
    const obj = node as Record<string, unknown>;
    const t = obj['@type'];
    if (t === type || (Array.isArray(t) && t.includes(type))) return true;
    if (obj['@graph'] && walk(obj['@graph'])) return true;
    return Object.values(obj).some((v) => typeof v === 'object' && walk(v));
  };
  return blocks.some(walk);
}

export function runSeoStaticChecks(
  pages: AuditPage[],
  sitemapPaths: Set<string>,
  baseUrl: string,
  onProgress?: (msg: string) => void,
  /** Canonical hrefs in dist/ always point at production; use prod base on local audits. */
  canonicalBaseUrl?: string,
  signal?: AbortSignal,
): SeoFinding[] {
  const canonicalBase = canonicalBaseUrl ?? baseUrl;
  const findings: SeoFinding[] = [];
  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();

  onProgress?.(`SEO static: checking ${pages.length} pages`);
  for (let i = 0; i < pages.length; i++) {
    throwIfAborted(signal);
    const page = pages[i]!;
    onProgress?.(`SEO static: ${page.path} (${i + 1}/${pages.length})`);
    const html = readDistHtml(page.htmlRel);
    const doc = parseHtml(html);
    const isMain = page.tags.includes('main');

    const htmlLang = doc.querySelector('html')?.getAttribute('lang')?.trim() ?? '';
    if (!htmlLang) {
      findings.push({
        page: page.path,
        rule: 'html-lang',
        severity: 'error',
        detail: 'missing html lang attribute',
      });
    }

    if (page.tags.includes('development')) {
      const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
      if (!/noindex/i.test(robots)) {
        findings.push({
          page: page.path,
          rule: 'dev-noindex',
          severity: 'error',
          detail: 'in-development page should have noindex robots meta',
        });
      }
    }

    const title = doc.querySelector('title')?.text.trim() ?? '';
    const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '';

    if (title) {
      const list = titles.get(title) ?? [];
      list.push(page.path);
      titles.set(title, list);
    }
    if (desc) {
      const list = descriptions.get(desc) ?? [];
      list.push(page.path);
      descriptions.set(desc, list);
    }

    const titleLen = title.length;
    const descLen = desc.length;
    const titleBounds = isMain ? SEO_TITLE_LEN : { min: 20, max: 70 };
    const descBounds = isMain ? SEO_DESC_LEN : { min: 50, max: 180 };

    if (titleLen < titleBounds.min || titleLen > titleBounds.max) {
      findings.push({
        page: page.path,
        rule: 'title-length',
        severity: 'warning',
        detail: `title length ${titleLen} (expected ${titleBounds.min}-${titleBounds.max})`,
      });
    }
    if (descLen < descBounds.min || descLen > descBounds.max) {
      findings.push({
        page: page.path,
        rule: 'description-length',
        severity: 'warning',
        detail: `description length ${descLen} (expected ${descBounds.min}-${descBounds.max})`,
      });
    }

    const jsonLdBlocks = parseJsonLd(html, page.path, findings);
    for (const type of expectedJsonLdTypes(page)) {
      if (!jsonLdHasType(jsonLdBlocks, type)) {
        findings.push({
          page: page.path,
          rule: 'json-ld-missing',
          severity: 'error',
          detail: `missing JSON-LD @type ${type}`,
        });
      }
    }

    for (const prop of ['og:url', 'og:type', 'twitter:card'] as const) {
      const sel = prop.startsWith('og:')
        ? `meta[property="${prop}"]`
        : `meta[name="${prop}"]`;
      if (!doc.querySelector(sel)) {
        findings.push({
          page: page.path,
          rule: 'social-meta-missing',
          severity: 'error',
          detail: `missing ${prop}`,
        });
      }
    }

    const locale = page.locale === 'de' ? 'de_DE' : 'en_US';
    const altLocale = page.locale === 'de' ? 'en_US' : 'de_DE';
    if (!doc.querySelector(`meta[property="og:locale"][content="${locale}"]`)) {
      findings.push({
        page: page.path,
        rule: 'og-locale',
        severity: 'error',
        detail: `missing or wrong og:locale (expected ${locale})`,
      });
    }
    if (!doc.querySelector(`meta[property="og:locale:alternate"][content="${altLocale}"]`)) {
      findings.push({
        page: page.path,
        rule: 'og-locale-alternate',
        severity: 'error',
        detail: `missing og:locale:alternate ${altLocale}`,
      });
    }

    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
    const expected = absCanonical(canonicalBase, page.path);
    if (canonical && canonical.replace(/\/$/, '') !== expected.replace(/\/$/, '')) {
      findings.push({
        page: page.path,
        rule: 'canonical-mismatch',
        severity: 'error',
        detail: `canonical ${canonical} != expected ${expected}`,
      });
    }

    const h1s = doc.querySelectorAll('h1');
    if (h1s.length !== 1) {
      findings.push({
        page: page.path,
        rule: 'h1-count',
        severity: 'error',
        detail: `expected 1 h1, found ${h1s.length}`,
      });
    }

    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')?.trim() ?? '';
    if (ogImage) {
      const asset = distAssetPath(ogImage);
      if (asset) {
        const dims = readImageDimensions(asset);
        if (!dims) {
          findings.push({
            page: page.path,
            rule: 'og-image-missing',
            severity: 'error',
            detail: `og:image file not found or unreadable: ${ogImage}`,
          });
        } else if (dims.width < 1200 || dims.height < 630) {
          findings.push({
            page: page.path,
            rule: 'og-image-size',
            severity: 'warning',
            detail: `og:image ${dims.width}×${dims.height} (expected ≥1200×630)`,
          });
        }
      }
    }

    checkHeadingOrder(doc, page.path, findings);

    for (const img of doc.querySelectorAll('img')) {
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        findings.push({
          page: page.path,
          rule: 'img-dimensions',
          severity: 'warning',
          detail: `img missing width/height: ${img.getAttribute('src') ?? '(no src)'}`,
        });
      }
      if (!img.hasAttribute('alt')) {
        findings.push({
          page: page.path,
          rule: 'img-alt',
          severity: 'error',
          detail: `img missing alt: ${img.getAttribute('src') ?? '(no src)'}`,
        });
      }
      const src = img.getAttribute('src') ?? '';
      const classNames = img.getAttribute('class') ?? '';
      const skipFormat = shouldSkipImgFormatWarning(src, {
        lqipWebp: img.hasAttribute('lqip-webp'),
        lqipGif: img.hasAttribute('lqip-gif'),
        lqipIgnore: img.hasAttribute('lqip-ignore'),
        heroImg: classNames.split(/\s+/).includes('heroImg'),
      });
      if (
        !skipFormat &&
        /\.(png|jpe?g)(\?|$)/i.test(src) &&
        !/\.(webp|avif)(\?|$)/i.test(src)
      ) {
        findings.push({
          page: page.path,
          rule: 'img-format',
          severity: 'warning',
          detail: `non-modern image format: ${src}`,
        });
      }
    }

    const inSitemap = sitemapPaths.has(page.path.replace(/\/$/, '') || '/');
    if (page.tags.includes('development') && inSitemap) {
      findings.push({
        page: page.path,
        rule: 'sitemap-development',
        severity: 'error',
        detail: 'development page must not appear in sitemap',
      });
    }
    if (!page.tags.includes('development') && page.slug && !inSitemap) {
      findings.push({
        page: page.path,
        rule: 'sitemap-missing-published',
        severity: 'error',
        detail: 'published page missing from sitemap',
      });
    }
  }

  for (const [title, paths] of titles) {
    if (paths.length > 1) {
      for (const p of paths) {
        findings.push({
          page: p,
          rule: 'duplicate-title',
          severity: 'warning',
          detail: `duplicate title "${title}" on ${paths.join(', ')}`,
        });
      }
    }
  }
  for (const [desc, paths] of descriptions) {
    if (paths.length > 1) {
      for (const p of paths) {
        findings.push({
          page: p,
          rule: 'duplicate-description',
          severity: 'warning',
          detail: `duplicate description on ${paths.join(', ')}`,
        });
      }
    }
  }

  checkRobotsTxt(findings);
  checkHreflangReciprocity(pages, findings);

  return findings;
}

export async function runLinkCheck(
  baseUrl: string,
  onProgress?: (msg: string) => void,
): Promise<{ passed: boolean; failures: string[] }> {
  const checker = new LinkChecker();
  let linksChecked = 0;
  checker.on('pagestart', (url) => {
    onProgress?.(`Link crawl: scanning ${url}`);
  });
  checker.on('link', () => {
    linksChecked++;
    if (linksChecked % 50 === 0) {
      onProgress?.(`Link crawl: checked ${linksChecked} links…`);
    }
  });
  onProgress?.(`Link crawl: starting at ${baseUrl} (recursive)`);
  const result = await checker.check({
    path: baseUrl,
    recurse: true,
    linksToSkip: (link) =>
      Promise.resolve(
        /^mailto:/.test(link) || /^tel:/.test(link) || shouldSkipLinkCheckUrl(link),
      ),
  });
  onProgress?.(
    `Link crawl: done (${result.links.length} links, ${result.passed ? 'passed' : 'failures'})`,
  );
  const failures = result.links
    .filter((r) => r.status !== 200 && r.status !== 0)
    .filter((r) => !shouldSkipLinkCheckUrl(r.url))
    .map((r) => `${r.status ?? 'undefined'} ${r.url}`);
  return { passed: failures.length === 0, failures };
}

export async function runSeoStage(options: {
  pages: AuditPage[];
  sitemapPaths: Set<string>;
  baseUrl: string;
  canonicalBaseUrl?: string;
  skipLinks?: boolean;
  lighthousePages?: LighthousePageMedian[];
  onProgress?: (msg: string) => void;
  signal?: AbortSignal;
}): Promise<SeoStageResult & { aborted?: boolean }> {
  const onProgress = options.onProgress;
  let findings: SeoFinding[] = [];
  let linkCheck: SeoStageResult['linkCheck'];
  try {
    findings = runSeoStaticChecks(
      options.pages,
      options.sitemapPaths,
      options.baseUrl,
      onProgress,
      options.canonicalBaseUrl,
      options.signal,
    );
    findings = mergeLighthouseAuditFindings(findings, options.lighthousePages);
    onProgress?.(`SEO static: ${findings.length} finding(s)`);
    throwIfAborted(options.signal);
    if (!options.skipLinks) {
      linkCheck = await runLinkCheck(options.baseUrl, onProgress);
    } else {
      onProgress?.('Link crawl: skipped (quick level)');
    }
    return { findings, linkCheck };
  } catch (err) {
    if (isAuditAborted(err)) {
      return { findings, linkCheck, aborted: true };
    }
    throw err;
  }
}
