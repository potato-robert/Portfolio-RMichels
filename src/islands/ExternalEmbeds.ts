import { EXTERNAL_MEDIA_STORAGE_KEY } from '../lib/legal';

type RememberedMedia = Partial<Record<string, boolean>>;

function readRemembered(): RememberedMedia {
  try {
    const raw = localStorage.getItem(EXTERNAL_MEDIA_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as RememberedMedia;
  } catch {
    return {};
  }
}

function writeRemembered(map: RememberedMedia): void {
  try {
    localStorage.setItem(EXTERNAL_MEDIA_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function rememberProvider(providerId: string): void {
  const map = readRemembered();
  map[providerId] = true;
  writeRemembered(map);
}

function iframeFromPlaceholder(el: HTMLElement): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  for (const attr of el.attributes) {
    if (!attr.name.startsWith('data-iframe-')) continue;
    const key = attr.name.slice('data-iframe-'.length);
    iframe.setAttribute(key, attr.value);
  }
  iframe.loading = 'lazy';
  return iframe;
}

function loadEmbed(placeholder: HTMLElement, remember: boolean): void {
  const provider = placeholder.dataset.provider;
  if (remember && provider) {
    rememberProvider(provider);
  }

  const iframe = iframeFromPlaceholder(placeholder);
  placeholder.replaceChildren(iframe);
  placeholder.classList.add('external-embed-placeholder--loaded');
}

function initPlaceholder(placeholder: HTMLElement): void {
  const provider = placeholder.dataset.provider;
  const remembered = provider ? readRemembered()[provider] === true : false;

  if (remembered) {
    loadEmbed(placeholder, false);
    return;
  }

  const loadBtn = placeholder.querySelector<HTMLButtonElement>('[data-embed-load]');
  const rememberCheckbox = placeholder.querySelector<HTMLInputElement>('[data-embed-remember]');

  loadBtn?.addEventListener('click', () => {
    loadEmbed(placeholder, rememberCheckbox?.checked === true);
  });
}

document.querySelectorAll<HTMLElement>('[data-external-embed]').forEach(initPlaceholder);
