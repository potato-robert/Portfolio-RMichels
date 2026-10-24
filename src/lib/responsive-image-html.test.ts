import { describe, expect, it } from 'vitest';
import {
  inferResponsiveLayout,
  openAncestorClasses,
  renderResponsivePicture,
} from './responsive-image-html.ts';
import type { ImageAssetEntry } from '../integrations/rm-assets/types.ts';

const baseEntry: ImageAssetEntry = {
  kind: 'image',
  url: '/assets/img/canfit/op_process.png',
  sourceRel: 'img/canfit/op_process.png',
  width: 1651,
  height: 531,
  dominantColor: '#080808',
  placeholder: 'data:image/webp;base64,abc',
  avif: { 800: '/assets/img/canfit/op_process/_rm-gen/op_process/800.avif' },
  webp: { 800: '/assets/img/canfit/op_process/_rm-gen/op_process/800.webp' },
};

describe('renderResponsivePicture', () => {
  it('keeps AVIF and WebP for transparent PNGs without an LQIP matte', () => {
    const html = renderResponsivePicture({
      entry: { ...baseEntry, hasAlpha: true, dominantColor: 'transparent', placeholder: '' },
      alt: 'Workflow diagram',
      layout: 'fullWidth',
    });

    expect(html).toContain('src="/assets/img/canfit/op_process.png"');
    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
    expect(html).toContain('sizes="100vw"');
    expect(html).toContain('max-width:1651px');
    expect(html).not.toContain('background-color');
    expect(html).not.toContain('background-image');
  });

  it('treats a full-width media column as a full-bleed layout', () => {
    const html = `<section class="sectionMedia"><div class="mediaColumn mediaColumn-intrinsic"><figure><img src="/assets/img/canfit/op_process.png" alt="Workflow">`;
    const imgAt = html.indexOf('<img');
    expect(inferResponsiveLayout(openAncestorClasses(html.slice(0, imgAt)))).toBe('fullWidth');
  });

  it('keeps AVIF/WebP and LQIP for opaque images', () => {
    const html = renderResponsivePicture({
      entry: baseEntry,
      alt: 'Photo',
    });

    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
    expect(html).toContain('background-color:#080808');
  });
});
