import PhotoSwipeLightbox from 'photoswipe/lightbox';
import type { SlideData as PswpSlideData } from 'photoswipe';
import 'photoswipe/style.css';
import '../styles/components/_photoswipe.scss';
import { getScrollLenis } from '../lib/scroll-lenis';
import {
  collectCarouselFigures,
  figureToSlideData,
  findSlideIndex,
} from '../lib/project-lightbox';

function galleryDataSource(root: HTMLElement) {
  return {
    gallery: root,
    items: collectCarouselFigures(root),
  };
}

export function initProjectLightbox() {
  const projContent = document.getElementById('projContent');
  if (!projContent) return;

  const lightbox = new PhotoSwipeLightbox({
    gallery: '#projContent',
    children: 'figure:not([ignorecarousel]):has(img)',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.92,
    padding: { top: 16, bottom: 48, left: 16, right: 16 },
    showHideAnimationType: 'zoom',
    // PhotoSwipe caps fit at 1×; allow upscaling small images to fill the viewport.
    initialZoomLevel: (zoomLevel) => {
      const pan = zoomLevel.panAreaSize;
      const el = zoomLevel.elementSize;
      if (!pan || !el) return zoomLevel.fit;
      return Math.min(pan.x / el.x, pan.y / el.y);
    },
  });

  lightbox.addFilter('itemData', (itemData: PswpSlideData, _index: number) => {
    const element = itemData.element;
    if (!(element instanceof HTMLElement)) return itemData;

    const slide = figureToSlideData(element);
    if (!slide) return itemData;

    return {
      ...itemData,
      src: slide.src,
      width: slide.width,
      height: slide.height,
      alt: slide.alt,
      caption: slide.caption,
    };
  });

  lightbox.addFilter('thumbEl', (thumbEl, _itemData, index) => {
    if (thumbEl) return thumbEl;
    const items = collectCarouselFigures(projContent);
    const figure = items[index];
    const img = figure?.querySelector('img');
    if (img instanceof HTMLElement) return img;
    return figure ?? items[0] ?? projContent;
  });

  lightbox.on('uiRegister', () => {
    lightbox.pswp?.ui?.registerElement({
      name: 'custom-caption',
      className: 'pswp__custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      html: '',
      onInit: (el, pswp) => {
        pswp.on('change', () => {
          const caption = (pswp.currSlide?.data as { caption?: string }).caption ?? '';
          el.textContent = caption;
          el.hidden = !caption;
        });
      },
    });
  });

  lightbox.on('beforeOpen', () => {
    document.body.classList.add('is-lightbox-open');
    getScrollLenis()?.stop();
  });

  lightbox.on('destroy', () => {
    document.body.classList.remove('is-lightbox-open');
    getScrollLenis()?.start();
  });

  lightbox.init();

  const openAt = (source: HTMLElement | string) => {
    const figures = collectCarouselFigures(projContent);
    const index = findSlideIndex(figures, source);
    if (index < 0) return;
    lightbox.loadAndOpen(index, galleryDataSource(projContent));
  };

  projContent.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const lightboxLink = target.closest<HTMLElement>('[data-lightbox-id]');
    if (!lightboxLink) return;
    event.preventDefault();
    const id = lightboxLink.getAttribute('data-lightbox-id');
    if (id) openAt(id);
  });

  (window as Window & { viewImage?: typeof openAt }).viewImage = openAt;
}

function bootProjectLightbox(): void {
  if (!document.getElementById('projContent')) {
    requestAnimationFrame(bootProjectLightbox);
    return;
  }
  initProjectLightbox();
}

bootProjectLightbox();
