import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  readVisitorFilterSession,
  VISITOR_FILTER_STORAGE_KEY,
  writeVisitorFilterSession,
} from './visitor-filter';

function createSessionStorageMock(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe('visitor-filter session storage', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createSessionStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads and writes filter for the session', () => {
    writeVisitorFilterSession('vr,front-end');
    expect(readVisitorFilterSession()).toBe('vr,front-end');
  });

  it('clears filter when writing empty string', () => {
    writeVisitorFilterSession('vr');
    writeVisitorFilterSession('');
    expect(readVisitorFilterSession()).toBe('');
  });
});
