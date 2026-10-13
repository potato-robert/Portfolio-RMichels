import { afterEach, describe, expect, it, vi } from 'vitest';
import { is3dEnabled, SITE_3D_STORAGE_KEY } from './site-3d';

const storage = new Map<string, string>();

afterEach(() => {
  vi.unstubAllGlobals();
  storage.clear();
});

function mockBrowserStorage() {
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  });
}

describe('is3dEnabled', () => {
  it('defaults to true when unset', () => {
    mockBrowserStorage();
    expect(is3dEnabled()).toBe(true);
  });

  it('returns false when stored as false', () => {
    mockBrowserStorage();
    storage.set(SITE_3D_STORAGE_KEY, 'false');
    expect(is3dEnabled()).toBe(false);
  });

  it('returns true when stored as true', () => {
    mockBrowserStorage();
    storage.set(SITE_3D_STORAGE_KEY, 'true');
    expect(is3dEnabled()).toBe(true);
  });
});
