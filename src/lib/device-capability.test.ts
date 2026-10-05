import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAuditTierOverride,
  getDevicePerformanceTier,
  getWebGLPixelRatio,
  getWebGLRendererString,
  isIntelIntegratedGpu,
  isLowPoweredDevice,
  isRetinaDisplay,
  resetWebGLRendererCache,
  syncPerfTierToDocument,
} from './device-capability';

function mockNavigator(partial: Partial<Navigator & { deviceMemory?: number }>) {
  vi.stubGlobal('navigator', { userAgent: '', hardwareConcurrency: 8, ...partial });
}

function mockWindow(partial: { devicePixelRatio?: number; reducedMotion?: boolean }) {
  const dpr = partial.devicePixelRatio ?? 1;
  vi.stubGlobal('window', {
    devicePixelRatio: dpr,
    matchMedia: (query: string) => ({
      matches: query.includes('prefers-reduced-motion') && !!partial.reducedMotion,
    }),
  });
  vi.stubGlobal('document', {
    createElement: () => ({
      getContext: () => null,
    }),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  resetWebGLRendererCache();
});

describe('isLowPoweredDevice', () => {
  it('detects mobile user agents', () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    mockWindow({});
    expect(isLowPoweredDevice()).toBe(true);
  });

  it('detects prefers-reduced-motion', () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    mockWindow({ reducedMotion: true });
    expect(isLowPoweredDevice()).toBe(true);
  });

  it('detects low core count', () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', hardwareConcurrency: 4 });
    mockWindow({});
    expect(isLowPoweredDevice()).toBe(true);
  });

  it('detects low device memory', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 8,
      deviceMemory: 4,
    });
    mockWindow({});
    expect(isLowPoweredDevice()).toBe(true);
  });

  it('returns false for capable desktops', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 8,
      deviceMemory: 8,
    });
    mockWindow({});
    expect(isLowPoweredDevice()).toBe(false);
  });
});

describe('getAuditTierOverride', () => {
  it('returns null without perf=1', () => {
    vi.stubGlobal('window', { location: { search: '?auditTier=minimal' } });
    expect(getAuditTierOverride()).toBeNull();
  });

  it('returns tier when perf=1 and auditTier is valid', () => {
    vi.stubGlobal('window', { location: { search: '?perf=1&auditTier=reduced' } });
    expect(getAuditTierOverride()).toBe('reduced');
  });

  it('forces tier in getDevicePerformanceTier', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 16,
      deviceMemory: 32,
    });
    vi.stubGlobal('window', {
      devicePixelRatio: 1,
      location: { search: '?perf=1&auditTier=minimal' },
      matchMedia: () => ({ matches: false }),
    });
    expect(getDevicePerformanceTier()).toBe('minimal');
  });
});

describe('getDevicePerformanceTier', () => {
  it('returns minimal for mobile', () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    mockWindow({});
    expect(getDevicePerformanceTier()).toBe('minimal');
  });

  it('returns minimal for low core count', () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', hardwareConcurrency: 4 });
    mockWindow({});
    expect(getDevicePerformanceTier()).toBe('minimal');
  });

  it('returns reduced for Intel integrated GPU on capable desktop', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 8,
      deviceMemory: 8,
    });
    mockWindow({ devicePixelRatio: 2 });

    const mockGl = {
      getExtension: () => ({ UNMASKED_RENDERER_WEBGL: 0x1f01 }),
      getParameter: () => 'Intel(R) UHD Graphics 630',
    };
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: () => mockGl,
      }),
    });

    expect(getDevicePerformanceTier()).toBe('reduced');
    expect(isIntelIntegratedGpu()).toBe(true);
    expect(getWebGLRendererString()).toBe('Intel(R) UHD Graphics 630');
  });

  it('returns full for capable desktop with discrete GPU', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 8,
      deviceMemory: 8,
    });
    mockWindow({ devicePixelRatio: 2 });

    const mockGl = {
      getExtension: () => ({ UNMASKED_RENDERER_WEBGL: 0x1f01 }),
      getParameter: () => 'NVIDIA GeForce RTX 3080',
    };
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: () => mockGl,
      }),
    });

    expect(getDevicePerformanceTier()).toBe('full');
    expect(isIntelIntegratedGpu()).toBe(false);
  });
});

describe('isRetinaDisplay', () => {
  it('returns true when devicePixelRatio > 1', () => {
    mockWindow({ devicePixelRatio: 2 });
    expect(isRetinaDisplay()).toBe(true);
  });

  it('returns false for standard DPI', () => {
    mockWindow({ devicePixelRatio: 1 });
    expect(isRetinaDisplay()).toBe(false);
  });
});

describe('syncPerfTierToDocument', () => {
  it('writes tier to body dataset', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 4,
    });
    mockWindow({});
    vi.stubGlobal('document', {
      body: { dataset: {} as DOMStringMap },
    });
    expect(syncPerfTierToDocument()).toBe('minimal');
    expect(document.body.dataset.perfTier).toBe('minimal');
  });
});

describe('getWebGLPixelRatio', () => {
  it('returns full DPR on capable hardware', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 8,
      deviceMemory: 8,
    });
    mockWindow({ devicePixelRatio: 2 });
    expect(getWebGLPixelRatio()).toBe(2);
  });

  it('caps DPR on reduced-tier retina displays', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 8,
      deviceMemory: 8,
    });
    mockWindow({ devicePixelRatio: 2 });

    const mockGl = {
      getExtension: () => ({ UNMASKED_RENDERER_WEBGL: 0x1f01 }),
      getParameter: () => 'Intel(R) Iris(R) Xe Graphics',
    };
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: () => mockGl,
      }),
    });

    expect(getWebGLPixelRatio()).toBe(1.5);
  });

  it('caps DPR on minimal-tier low-powered retina (legacy path)', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 4,
    });
    mockWindow({ devicePixelRatio: 2 });
    expect(getWebGLPixelRatio()).toBe(1.5);
  });

  it('does not cap DPR on low-powered non-retina displays', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      hardwareConcurrency: 4,
    });
    mockWindow({ devicePixelRatio: 1 });
    expect(getWebGLPixelRatio()).toBe(1);
  });
});
