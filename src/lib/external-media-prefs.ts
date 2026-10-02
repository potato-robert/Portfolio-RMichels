import { EXTERNAL_MEDIA_PROVIDERS, EXTERNAL_MEDIA_STORAGE_KEY } from './legal';

export type RememberedMedia = Partial<Record<string, boolean>>;

export function allEmbedProviderIds(): string[] {
  return EXTERNAL_MEDIA_PROVIDERS.map((p) => p.id);
}

export function readRememberedMedia(): RememberedMedia {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(EXTERNAL_MEDIA_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as RememberedMedia;
  } catch {
    return {};
  }
}

export function writeRememberedMedia(map: RememberedMedia): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EXTERNAL_MEDIA_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function isEmbedProviderRemembered(id: string, map?: RememberedMedia): boolean {
  const m = map ?? readRememberedMedia();
  return m[id] === true;
}

export function rememberEmbedProvider(id: string): void {
  const map = readRememberedMedia();
  map[id] = true;
  writeRememberedMedia(map);
}

export function forgetEmbedProvider(id: string): void {
  const map = readRememberedMedia();
  delete map[id];
  writeRememberedMedia(map);
}

export function isAllEmbedsRemembered(map?: RememberedMedia): boolean {
  const m = map ?? readRememberedMedia();
  return allEmbedProviderIds().every((id) => m[id] === true);
}

export function isAnyEmbedRemembered(map?: RememberedMedia): boolean {
  const m = map ?? readRememberedMedia();
  return allEmbedProviderIds().some((id) => m[id] === true);
}

export function rememberAllEmbeds(): void {
  const map: RememberedMedia = {};
  for (const id of allEmbedProviderIds()) {
    map[id] = true;
  }
  writeRememberedMedia(map);
}

export function clearAllEmbedsRemembered(): void {
  writeRememberedMedia({});
}
