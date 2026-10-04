import { parse as parseHtml } from 'node-html-parser';
import { LinkChecker } from 'linkinator';
import { shouldSkipLinkCheckUrl } from '../config/link-check-skip.ts';
import { readDistHtml, type AuditPage } from '../config/pages.ts';
import { SEO_DESC_LEN, SEO_TITLE_LEN } from '../config/budgets.ts';
import { isAuditAborted, throwIfAborted } from '../lib/abort.ts';

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

function parseJsonLd(html: string): unknown[] {
  const scripts = parseHtml(html).querySelectorAll('script[type="application/ld+json"]');
  const out: unknown[] = [];
  for (const s of scripts) {
    try {
      out.push(JSON.parse(s.textContent));
    } catch {
      // invalid JSON-LD
    }
  }
  return out;
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

    for (const type of expectedJsonLdTypes(page)) {
      if (!jsonLdHasType(parseJsonLd(html), type)) {
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

    for (const img of doc.querySelectorAll('img')) {
      if (!img.hasAttribute('alt')) {
        findings.push({
          page: page.path,
          rule: 'img-alt',
          severity: 'error',
          detail: `img missing alt: ${img.getAttribute('src') ?? '(no src)'}`,
        });
      }
      const src = img.getAttribute('src') ?? '';
      if (/\.(png|jpe?g)(\?|$)/i.test(src) && !/\.(webp|avif)(\?|$)/i.test(src)) {
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
