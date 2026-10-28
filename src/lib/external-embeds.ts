import type { Locale } from './i18n';
import { EXTERNAL_MEDIA_PROVIDERS, getPrivacySettingsPath } from './legal';

export type EmbedProviderId = 'youtube' | 'sketchfab' | 'figma' | 'clirio';

type ProviderConfig = {
  id: EmbedProviderId;
  hostPatterns: RegExp[];
  rewriteSrc?: (src: string) => string;
};

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'youtube',
    hostPatterns: [/^(www\.)?youtube\.com$/i, /^www\.youtube-nocookie\.com$/i],
    rewriteSrc: (src) =>
      src.replace(/https?:\/\/(www\.)?youtube\.com/i, 'https://www.youtube-nocookie.com'),
  },
  {
    id: 'sketchfab',
    hostPatterns: [/^(www\.)?sketchfab\.com$/i],
  },
  {
    id: 'figma',
    hostPatterns: [/^(www\.)?figma\.com$/i],
  },
  {
    id: 'clirio',
    hostPatterns: [/^clirioview-viw-prd\.azurewebsites\.net$/i],
  },
];

const SITE_HOSTS = new Set(['rmichels.com', 'localhost', '127.0.0.1']);

function escapeAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
}

function getProviderForSrc(src: string): ProviderConfig | null {
  try {
    const url = new URL(src, 'https://rmichels.com');
    for (const provider of PROVIDERS) {
      if (provider.hostPatterns.some((re) => re.test(url.hostname))) {
        return provider;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function assertAllowedIframeSrc(src: string): ProviderConfig {
  const trimmed = src.trim();
  if (!trimmed) {
    throw new Error('external-embeds: iframe missing src');
  }

  let url: URL;
  try {
    url = new URL(trimmed, 'https://rmichels.com');
  } catch {
    throw new Error(`external-embeds: invalid iframe src: ${trimmed}`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`external-embeds: unsupported protocol in iframe src: ${trimmed}`);
  }

  if (SITE_HOSTS.has(url.hostname)) {
    throw new Error(`external-embeds: same-origin iframe must not use external gating: ${trimmed}`);
  }

  const provider = getProviderForSrc(trimmed);
  if (!provider) {
    throw new Error(
      `external-embeds: unregistered third-party iframe host "${url.hostname}". Add a provider in external-embeds.ts.`,
    );
  }
  return provider;
}

function extractIframeTag(html: string, startIndex: number): { tag: string; end: number } | null {
  const openEnd = html.indexOf('>', startIndex);
  if (openEnd === -1) return null;

  let depth = 1;
  let pos = openEnd + 1;
  const lower = html.toLowerCase();

  while (pos < html.length) {
    const nextOpen = lower.indexOf('<iframe', pos);
    const nextClose = lower.indexOf('</iframe>', pos);
    if (nextClose === -1) return null;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      pos = nextOpen + 7;
      continue;
    }

    depth -= 1;
    pos = nextClose + 9;
    if (depth === 0) {
      return { tag: html.slice(startIndex, pos), end: pos };
    }
  }

  return null;
}

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
};

/** Attribute text from serialized HTML, before escapeAttr runs again. */
function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] !== '#') {
      return NAMED_HTML_ENTITIES[body.toLowerCase()] ?? entity;
    }
    const codePoint =
      body[1] === 'x' || body[1] === 'X'
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return entity;
    return String.fromCodePoint(codePoint);
  });
}

function parseIframeAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const openEnd = tag.indexOf('>');
  const openTag = openEnd === -1 ? tag : tag.slice(0, openEnd);
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of openTag.matchAll(attrRe)) {
    const name = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? '';
    attrs[name] = decodeHtmlEntities(value);
  }

  const withoutQuoted = openTag.replace(/=\s*("[^"]*"|'[^']*')/g, '');
  const boolRe = /\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?=\s|\/|$)/g;
  for (const match of withoutQuoted.matchAll(boolRe)) {
    const name = match[1].toLowerCase();
    if (!(name in attrs)) attrs[name] = '';
  }
  return attrs;
}

/** Figma's own fullscreen control calls requestFullscreen from inside the frame. */
function withFullscreenPermission(attrs: Record<string, string>): Record<string, string> {
  if (!('allowfullscreen' in attrs)) return attrs;
  const allow = attrs.allow ?? '';
  if (/(?:^|;)\s*fullscreen\s*(?:;|$)/i.test(allow)) return attrs;
  const trimmed = allow.trim().replace(/;+\s*$/, '');
  return { ...attrs, allow: trimmed ? `${trimmed}; fullscreen` : 'fullscreen' };
}

function providerDisplayName(id: EmbedProviderId): string {
  return EXTERNAL_MEDIA_PROVIDERS.find((p) => p.id === id)?.displayName ?? id;
}

function embedStrings(locale: Locale) {
  if (locale === 'de') {
    return {
      notice: (name: string) =>
        `Dieser Inhalt wird von ${name} bereitgestellt. Beim Laden können Daten an den Anbieter übertragen werden.`,
      load: 'Inhalt laden',
      alwaysLoadAll: 'Einbettungen immer laden',
      privacySettings: 'Privacy-Einstellungen',
    };
  }
  return {
    notice: (name: string) =>
      `This content is provided by ${name}. Loading it may send data to that provider.`,
    load: 'Load content',
    alwaysLoadAll: 'Always load embedded content',
    privacySettings: 'Privacy settings',
  };
}

function buildPlaceholder(
  provider: ProviderConfig,
  attrs: Record<string, string>,
  locale: Locale,
): string {
  let src = attrs.src ?? '';
  if (provider.rewriteSrc) {
    src = provider.rewriteSrc(src);
  }

  const displayName = providerDisplayName(provider.id);
  const strings = embedStrings(locale);
  const choicesHref = getPrivacySettingsPath(locale);

  const iframeTitle = attrs.title?.trim() || displayName;
  const passthrough = withFullscreenPermission({ ...attrs, src, title: iframeTitle });
  const dataAttrs = Object.entries(passthrough)
    .map(([key, value]) => `data-iframe-${key}="${escapeAttr(value)}"`)
    .join(' ');

  const className = attrs.class ? ` external-embed ${attrs.class}` : ' external-embed';
  const style = attrs.style ? ` style="${escapeAttr(attrs.style)}"` : '';
  const width = attrs.width ? ` width="${escapeAttr(attrs.width)}"` : '';
  const height = attrs.height ? ` height="${escapeAttr(attrs.height)}"` : '';
  const title = escapeAttr(iframeTitle);

  return `<div class="external-embed-placeholder${className}"${style}${width}${height} data-external-embed data-provider="${provider.id}" ${dataAttrs} role="group" aria-label="${escapeAttr(title)}">
  <div class="external-embed-placeholder__stage">
    <div class="external-embed-placeholder__overlay">
      <p class="external-embed-placeholder__notice">${escapeAttr(strings.notice(displayName))}</p>
      <div class="external-embed-placeholder__actions">
        <button type="button" class="external-embed-placeholder__load" data-embed-load>${escapeAttr(strings.load)}</button>
        <button type="button" class="external-embed-placeholder__load-all" data-embed-load-all>${escapeAttr(strings.alwaysLoadAll)}</button>
      </div>
      <p class="external-embed-placeholder__settings">
        <a href="${choicesHref}">${escapeAttr(strings.privacySettings)}</a>
      </p>
    </div>
  </div>
</div>`;
}

export function transformExternalEmbeds(html: string, locale: Locale): string {
  let result = '';
  let cursor = 0;
  const lower = html.toLowerCase();

  while (cursor < html.length) {
    const iframeStart = lower.indexOf('<iframe', cursor);
    if (iframeStart === -1) {
      result += html.slice(cursor);
      break;
    }

    result += html.slice(cursor, iframeStart);
    const extracted = extractIframeTag(html, iframeStart);
    if (!extracted) {
      result += html.slice(iframeStart);
      break;
    }

    const attrs = parseIframeAttributes(extracted.tag);
    const provider = assertAllowedIframeSrc(attrs.src ?? '');
    result += buildPlaceholder(provider, attrs, locale);
    cursor = extracted.end;
  }

  return result;
}

export function getRegisteredProviderIds(): EmbedProviderId[] {
  return PROVIDERS.map((p) => p.id);
}
