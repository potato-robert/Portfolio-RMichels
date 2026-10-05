export const CAROUSEL_FIGURE_SELECTOR = '#projContent figure:not([ignorecarousel])';

export interface SlideData {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  element: HTMLElement;
}

const FALLBACK_WIDTH = 1600;
const FALLBACK_HEIGHT = 900;

export function collectCarouselFigures(root: ParentNode = document): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(CAROUSEL_FIGURE_SELECTOR)).filter(
    (figure) => figure.querySelector('img') !== null,
  );
}

export function resolveSlideSrc(img: HTMLImageElement): string {
  const full = img.getAttribute('data-full-src');
  if (full) return full;
  const video = img.closest('video');
  if (video) {
    const fromVideo = video.getAttribute('data-full-src');
    if (fromVideo) return fromVideo;
  }
  return img.currentSrc || img.src;
}

export function resolveSlideDimensions(img: HTMLImageElement): { width: number; height: number } {
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    return { width: img.naturalWidth, height: img.naturalHeight };
  }

  const widthAttr = Number(img.getAttribute('width'));
  const heightAttr = Number(img.getAttribute('height'));
  if (widthAttr > 0 && heightAttr > 0) {
    return { width: widthAttr, height: heightAttr };
  }

  return { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
}

export function resolveCaption(figure: HTMLElement): string {
  const ownCaption = figure.querySelector(':scope > figcaption');
  if (ownCaption?.textContent?.trim()) {
    return ownCaption.textContent.trim();
  }

  const parentFigure = figure.parentElement?.closest('figure');
  if (parentFigure && parentFigure !== figure) {
    const parentCaption = parentFigure.querySelector(':scope > figcaption');
    if (parentCaption?.textContent?.trim()) {
      return parentCaption.textContent.trim();
    }
  }

  return '';
}

export function figureToSlideData(figure: HTMLElement): SlideData | null {
  const img = figure.querySelector('img');
  if (!img) return null;

  const { width, height } = resolveSlideDimensions(img);

  return {
    src: resolveSlideSrc(img),
    width,
    height,
    alt: img.alt ?? '',
    caption: resolveCaption(figure),
    element: figure,
  };
}

export function buildSlideData(root: ParentNode = document): SlideData[] {
  return collectCarouselFigures(root)
    .map((figure) => figureToSlideData(figure))
    .filter((slide): slide is SlideData => slide !== null);
}

export function findSlideIndex(
  figures: HTMLElement[],
  target: HTMLElement | string,
): number {
  if (typeof target === 'string') {
    const byId = document.getElementById(target);
    if (byId) {
      const figure = byId.closest('figure');
      if (figure) return figures.indexOf(figure as HTMLElement);
    }
    return -1;
  }

  const figure = target.closest('figure');
  if (!figure) return -1;
  return figures.indexOf(figure as HTMLElement);
}
