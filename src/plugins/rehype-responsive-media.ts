import type { Element, Root } from 'hast';

type RawNode = { type: 'raw'; value: string };
import { visit } from 'unist-util-visit';
import { manifestKeyFromUrl, resolveContentAssetRef } from '../integrations/rm-assets/resolve-url.ts';
import type { ResponsiveLayout } from '../lib/responsive-image-html.ts';
import { renderResponsivePicture } from '../lib/responsive-image-html.ts';
import type { RmAssetsManifest } from '../integrations/rm-assets/types.ts';
import {
  getImageEntryFromManifest,
  readRmAssetsManifest,
} from '../lib/rm-assets.ts';

function inferLayout(classNames: string): ResponsiveLayout {
  if (classNames.includes('mediaColumn')) return 'mediaColumn';
  if (classNames.includes('sectionMedia')) return 'sectionMedia';
  return 'default';
}

function classNameProp(properties: Element['properties']): string {
  const raw = properties?.className;
  if (!raw) return '';
  return Array.isArray(raw) ? raw.join(' ') : String(raw);
}

function attrFromTag(tag: string, name: string): string {
  const re = new RegExp(`\\s${name}=["']([^"']*)["']`, 'i');
  return tag.match(re)?.[1] ?? '';
}

function renderVideoHtml(
  manifest: RmAssetsManifest,
  src: string,
  className: string,
): string | null {
  const video = manifest.entries[manifestKeyFromUrl(src)];
  if (video?.kind !== 'video') return null;
  const classAttr = className ? ` class="${className.replace(/"/g, '&quot;')}"` : '';
  return `<video autoplay muted loop playsinline poster="${video.poster}" width="${video.width}" height="${video.height}" data-full-src="${video.url}"${classAttr}><source src="${video.webm}" type="video/webm"><source src="${video.url}" type="video/mp4"></video>`;
}

function transformImgTagsInHtml(html: string, manifest: RmAssetsManifest): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = attrFromTag(tag, 'src');
    if (!src.startsWith('/assets/')) return tag;

    const lookup = resolveContentAssetRef(src, tag);
    if (lookup.toLowerCase().endsWith('.gif')) {
      return renderVideoHtml(manifest, lookup, attrFromTag(tag, 'class')) ?? tag;
    }

    const entry =
      getImageEntryFromManifest(manifest, lookup) ?? getImageEntryFromManifest(manifest, src);
    if (!entry) return tag;

    const className = attrFromTag(tag, 'class');
    return renderResponsivePicture({
      entry,
      alt: attrFromTag(tag, 'alt'),
      layout: inferLayout(className),
      className,
      loading: 'lazy',
      decoding: 'async',
    });
  });
}

export function rehypeResponsiveMedia() {
  const manifest = readRmAssetsManifest();
  return (tree: Root) => {
    visit(tree, (node) => {
      const raw = node as unknown as RawNode;
      if (raw.type !== 'raw') return;
      if (!raw.value.includes('<img')) return;
      raw.value = transformImgTagsInHtml(raw.value, manifest);
    });

    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === null || index === undefined || node.tagName !== 'img') return;

      const src = String(node.properties?.src ?? '');
      if (!src.startsWith('/assets/')) return;

      const hint = JSON.stringify(node.properties ?? {});
      const lookup = resolveContentAssetRef(src, hint);
      if (lookup.toLowerCase().endsWith('.gif')) {
        const key = manifestKeyFromUrl(lookup);
        const video = manifest.entries[key];
        if (video?.kind === 'video') {
          const className = classNameProp(node.properties);
          const classList = className ? className.split(/\s+/).filter(Boolean) : undefined;
          parent.children[index] = {
            type: 'element',
            tagName: 'video',
            properties: {
              autoplay: true,
              muted: true,
              loop: true,
              playsinline: true,
              poster: video.poster,
              className: classList,
              width: video.width,
              height: video.height,
              'data-full-src': video.url,
            },
            children: [
              {
                type: 'element',
                tagName: 'source',
                properties: { src: video.webm, type: 'video/webm' },
                children: [],
              },
              {
                type: 'element',
                tagName: 'source',
                properties: { src: video.url, type: 'video/mp4' },
                children: [],
              },
            ],
          };
        }
        return;
      }

      const entry =
        getImageEntryFromManifest(manifest, lookup) ?? getImageEntryFromManifest(manifest, src);
      if (!entry) return;

      const className = classNameProp(node.properties);
      const layout = inferLayout(className);
      const alt = String(node.properties?.alt ?? '');
      const html = renderResponsivePicture({
        entry,
        alt,
        layout,
        className,
        loading: 'lazy',
        decoding: 'async',
      });

      parent.children[index] = { type: 'raw', value: html } as unknown as (typeof parent.children)[number];
    });
  };
}
