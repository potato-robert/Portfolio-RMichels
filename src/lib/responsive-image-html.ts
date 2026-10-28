import type { ImageAssetEntry } from '../integrations/rm-assets/types.ts';
import { buildSrcset } from './rm-assets.ts';

export type ResponsiveLayout =
  | 'hero'
  | 'tile'
  | 'landingModel'
  | 'portrait'
  | 'mediaColumn'
  | 'sectionMedia'
  | 'fullWidth'
  | 'default';

const SIZES: Record<ResponsiveLayout, string> = {
  hero: '(min-width: 1200px) 50vw, 100vw',
  tile: '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw',
  landingModel: '(min-width: 1200px) 50vw, 100vw',
  portrait: '(min-width: 900px) 320px, 60vw',
  mediaColumn: '(min-width: 900px) 640px, 100vw',
  sectionMedia: '(min-width: 1200px) 800px, 100vw',
  /** Full-bleed diagrams. Overestimates slightly so the browser does not pick a soft small width. */
  fullWidth: '100vw',
  default: '(min-width: 900px) 800px, 100vw',
};

export interface ResponsiveImageOptions {
  entry: ImageAssetEntry;
  alt: string;
  layout?: ResponsiveLayout;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchpriority?: 'high' | 'low' | 'auto';
  extraAttrs?: Record<string, string | boolean | undefined>;
}

function attrsToString(attrs: Record<string, string | boolean | undefined>): string {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${String(v).replace(/"/g, '&quot;')}"`))
    .join(' ');
}

export function renderResponsivePicture(options: ResponsiveImageOptions): string {
  const {
    entry,
    alt,
    layout = 'default',
    className,
    loading = 'lazy',
    decoding = 'async',
    fetchpriority,
    extraAttrs = {},
  } = options;

  const hasAlpha = entry.hasAlpha === true;
  const avifSrcset = buildSrcset(entry.avif);
  const webpSrcset = buildSrcset(entry.webp);
  const sizes = SIZES[layout];
  const placeholderStyle = hasAlpha
    ? ''
    : `background-color:${entry.dominantColor};background-image:url(${entry.placeholder});background-size:cover;background-position:center;`;
  const isTile = layout === 'tile';
  const isPortrait = layout === 'portrait';
  const pictureClass = isTile ? 'responsivePicture responsivePicture--tile' : 'responsivePicture';
  const portraitReserveStyle =
    isPortrait && entry.width > 0 && entry.height > 0
      ? `width:100%;aspect-ratio:${entry.width}/${entry.height};`
      : '';
  const pictureStyle = hasAlpha
    ? ''
    : isTile
      ? placeholderStyle
      : isPortrait
        ? `${portraitReserveStyle}${placeholderStyle}`
        : '';
  const pictureStyleAttr = pictureStyle ? ` style="${pictureStyle}"` : '';

  const intrinsicCap =
    layout === 'fullWidth' && entry.width > 0 ? `max-width:${entry.width}px;` : '';
  const imgStyle = `${isTile || hasAlpha ? '' : placeholderStyle}${intrinsicCap}`;

  const imgAttrs = attrsToString({
    src: entry.url,
    alt,
    width: String(entry.width),
    height: String(entry.height),
    loading,
    decoding,
    fetchpriority,
    class: className,
    sizes,
    'data-full-src': entry.url,
    ...(imgStyle ? { style: imgStyle } : {}),
    ...extraAttrs,
  });

  return `<picture class="${pictureClass}"${pictureStyleAttr}>${avifSrcset ? `<source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">` : ''}${webpSrcset ? `<source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">` : ''}<img ${imgAttrs}></picture>`;
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

/** Classes of elements still open before `html` ends (the img itself is not included). */
export function openAncestorClasses(htmlBeforeImg: string): string {
  const stack: string[] = [];
  const tagRe = /<\/?([a-zA-Z0-9]+)([^>]*)>/g;
  for (const match of htmlBeforeImg.matchAll(tagRe)) {
    const raw = match[0];
    const name = match[1].toLowerCase();
    const attrs = match[2] ?? '';
    if (raw.startsWith('</')) {
      for (let i = stack.length - 1; i >= 0; i--) {
        const open = stack[i];
        const openName = open.slice(0, open.indexOf(' ') === -1 ? open.length : open.indexOf(' '));
        if (openName === name) {
          stack.splice(i, 1);
          break;
        }
      }
      continue;
    }
    if (raw.endsWith('/>') || VOID_TAGS.has(name)) continue;
    const className = attrs.match(/\sclass=["']([^"']*)["']/i)?.[1] ?? '';
    stack.push(className ? `${name} ${className}` : name);
  }
  return stack.join(' ');
}

export function inferResponsiveLayout(classNames: string): ResponsiveLayout {
  if (
    classNames.includes('mediaColumn-fullWidth') ||
    classNames.includes('mediaColumn-intrinsic')
  ) {
    return 'fullWidth';
  }
  if (classNames.includes('mediaColumn')) return 'mediaColumn';
  if (classNames.includes('sectionMedia')) return 'sectionMedia';
  return 'default';
}
