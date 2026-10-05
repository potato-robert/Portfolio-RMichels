import type { ImageAssetEntry } from '../integrations/rm-assets/types.ts';
import { buildSrcset } from './rm-assets.ts';

export type ResponsiveLayout =
  | 'hero'
  | 'tile'
  | 'landingModel'
  | 'portrait'
  | 'mediaColumn'
  | 'sectionMedia'
  | 'default';

const SIZES: Record<ResponsiveLayout, string> = {
  hero: '(min-width: 1200px) 50vw, 100vw',
  tile: '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw',
  landingModel: '(min-width: 1200px) 50vw, 100vw',
  portrait: '(min-width: 900px) 320px, 60vw',
  mediaColumn: '(min-width: 900px) 640px, 100vw',
  sectionMedia: '(min-width: 1200px) 800px, 100vw',
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

  const avifSrcset = buildSrcset(entry.avif);
  const webpSrcset = buildSrcset(entry.webp);
  const sizes = SIZES[layout];
  const placeholderStyle = `background-color:${entry.dominantColor};background-image:url(${entry.placeholder});background-size:cover;background-position:center;`;
  const isTile = layout === 'tile';
  const isPortrait = layout === 'portrait';
  const pictureClass = isTile ? 'responsivePicture responsivePicture--tile' : 'responsivePicture';
  const portraitReserveStyle =
    isPortrait && entry.width > 0 && entry.height > 0
      ? `width:100%;aspect-ratio:${entry.width}/${entry.height};`
      : '';
  const pictureStyle = isTile
    ? placeholderStyle
    : isPortrait
      ? `${portraitReserveStyle}${placeholderStyle}`
      : '';
  const pictureStyleAttr = pictureStyle ? ` style="${pictureStyle}"` : '';

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
    ...(isTile ? {} : { style: placeholderStyle }),
    ...extraAttrs,
  });

  return `<picture class="${pictureClass}"${pictureStyleAttr}>${avifSrcset ? `<source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">` : ''}${webpSrcset ? `<source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">` : ''}<img ${imgAttrs}></picture>`;
}
