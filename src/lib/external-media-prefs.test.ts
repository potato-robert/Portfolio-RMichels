/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  allEmbedProviderIds,
  clearAllEmbedsRemembered,
  isAllEmbedsRemembered,
  isAnyEmbedRemembered,
  readRememberedMedia,
  rememberAllEmbeds,
  rememberEmbedProvider,
  forgetEmbedProvider,
} from './external-media-prefs';
import { EXTERNAL_MEDIA_STORAGE_KEY } from './legal';

describe('external-media-prefs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('lists all registered embed providers from legal config', () => {
    expect(allEmbedProviderIds()).toEqual(['youtube', 'sketchfab', 'figma', 'clirio']);
  });

  it('rememberAllEmbeds sets every provider flag', () => {
    rememberAllEmbeds();
    expect(isAllEmbedsRemembered()).toBe(true);
    const raw = localStorage.getItem(EXTERNAL_MEDIA_STORAGE_KEY);
    expect(JSON.parse(raw ?? '{}')).toEqual({
      youtube: true,
      sketchfab: true,
      figma: true,
      clirio: true,
    });
  });

  it('clearAllEmbedsRemembered removes all flags', () => {
    rememberAllEmbeds();
    clearAllEmbedsRemembered();
    expect(readRememberedMedia()).toEqual({});
    expect(isAnyEmbedRemembered()).toBe(false);
  });

  it('single provider remember is partial, not all', () => {
    rememberEmbedProvider('youtube');
    expect(isAnyEmbedRemembered()).toBe(true);
    expect(isAllEmbedsRemembered()).toBe(false);
  });

  it('forgetEmbedProvider removes one entry', () => {
    rememberAllEmbeds();
    forgetEmbedProvider('youtube');
    expect(isAllEmbedsRemembered()).toBe(false);
    expect(readRememberedMedia().youtube).toBeUndefined();
    expect(readRememberedMedia().sketchfab).toBe(true);
  });
});
