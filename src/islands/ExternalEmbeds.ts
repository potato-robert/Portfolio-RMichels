import {
  isEmbedProviderRemembered,
  rememberAllEmbeds,
  rememberEmbedProvider,
} from '../lib/external-media-prefs';
import { getScrollLenis } from '../lib/scroll-lenis';

function iframeFromPlaceholder(el: HTMLElement): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  for (const attr of el.attributes) {
    if (!attr.name.startsWith('data-iframe-')) continue;
    const key = attr.name.slice('data-iframe-'.length);
    iframe.setAttribute(key, attr.value);
  }
  iframe.loading = 'lazy';
  if (!iframe.getAttribute('title')?.trim()) {
    iframe.title = el.dataset.provider ?? 'Embedded content';
  }
  return iframe;
}

function loadEmbed(placeholder: HTMLElement, remember: boolean): void {
  const provider = placeholder.dataset.provider;
  if (remember && provider) {
    rememberEmbedProvider(provider);
  }

  const iframe = iframeFromPlaceholder(placeholder);
  if (
    placeholder.classList.contains('clirioScanShareEmbed') &&
    !iframe.classList.contains('clirioScanShareEmbed')
  ) {
    iframe.classList.add('clirioScanShareEmbed');
  }
  placeholder.replaceChildren(iframe);
  placeholder.classList.add('external-embed-placeholder--loaded');

  requestAnimationFrame(() => {
    getScrollLenis()?.resize();
    window.locoScroll?.update?.();
  });
}

function initPlaceholder(placeholder: HTMLElement): void {
  const provider = placeholder.dataset.provider;
  const remembered = provider ? isEmbedProviderRemembered(provider) : false;

  if (remembered) {
    loadEmbed(placeholder, false);
    return;
  }

  const loadBtn = placeholder.querySelector<HTMLButtonElement>('[data-embed-load]');
  const loadAllBtn = placeholder.querySelector<HTMLButtonElement>('[data-embed-load-all]');

  loadBtn?.addEventListener('click', () => {
    loadEmbed(placeholder, false);
  });

  loadAllBtn?.addEventListener('click', () => {
    rememberAllEmbeds();
    loadEmbed(placeholder, false);
  });
}

document.querySelectorAll<HTMLElement>('[data-external-embed]').forEach(initPlaceholder);
