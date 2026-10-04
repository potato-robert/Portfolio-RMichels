import type { BrowserContext, Page } from '@playwright/test';
import type { AuditProfile, NetworkPreset } from '../config/profiles.ts';
import { loadBrowserEvaluateFn } from './browser-scripts.ts';

type ProfileEmulationInitArgs = {
  hw?: number;
  mem?: number;
  renderer?: string;
};

const profileEmulationInit = loadBrowserEvaluateFn<
  (args: ProfileEmulationInitArgs) => void
>('profile-emulation-init.browser.js');

const NETWORK_CONDITIONS: Record<
  Exclude<NetworkPreset, 'none'>,
  {
    offline: boolean;
    latency: number;
    downloadThroughput: number;
    uploadThroughput: number;
    connectionType: 'none' | 'cellular2g' | 'cellular3g' | 'cellular4g' | 'bluetooth' | 'ethernet' | 'wifi' | 'wimax' | 'other';
  }
> = {
  offline: {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
    connectionType: 'none',
  },
  '3g': {
    offline: false,
    latency: 400,
    downloadThroughput: (500 * 1024) / 8,
    uploadThroughput: (500 * 1024) / 8,
    connectionType: 'cellular3g',
  },
  slow4g: {
    offline: false,
    latency: 150,
    downloadThroughput: (1.5 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    connectionType: 'cellular4g',
  },
  fast4g: {
    offline: false,
    latency: 80,
    downloadThroughput: (4 * 1024 * 1024) / 8,
    uploadThroughput: (2 * 1024 * 1024) / 8,
    connectionType: 'cellular4g',
  },
  cable: {
    offline: false,
    latency: 20,
    downloadThroughput: (10 * 1024 * 1024) / 8,
    uploadThroughput: (5 * 1024 * 1024) / 8,
    connectionType: 'wifi',
  },
};

export function chromiumLaunchArgs(profile: AuditProfile): string[] {
  const args: string[] = [];
  if (profile.gpuMode === 'swiftshader') {
    args.push('--use-angle=swiftshader');
  }
  if (profile.gpuMode === 'disabled') {
    args.push('--disable-webgl', '--disable-3d-apis');
  }
  return args;
}

export async function applyProfileEmulation(
  context: BrowserContext,
  profile: AuditProfile,
): Promise<string[]> {
  const notes: string[] = [];
  if (profile.skipEmulationNote) notes.push(profile.skipEmulationNote);

  await context.addInitScript(profileEmulationInit, {
    hw: profile.hardwareConcurrency,
    mem: profile.deviceMemory,
    renderer: profile.webglRenderer,
  });

  return notes;
}

export async function applyChromiumCdpEmulation(page: Page, profile: AuditProfile): Promise<string[]> {
  const notes: string[] = [];

  if (profile.browser === 'chromium') {
    const cdp = await page.context().newCDPSession(page);
    if (profile.cpuThrottleRate > 1) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuThrottleRate });
    }
    if (profile.network !== 'none') {
      const cond = NETWORK_CONDITIONS[profile.network];
      await cdp.send('Network.emulateNetworkConditions', cond);
    }
  } else {
    notes.push('CPU/network CDP emulation skipped on WebKit');
  }

  return notes;
}

export async function newContextForProfile(
  browser: { newContext: (opts: object) => Promise<BrowserContext> },
  profile: AuditProfile,
): Promise<BrowserContext> {
  return browser.newContext({
    viewport: profile.viewport,
    deviceScaleFactor: profile.deviceScaleFactor,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
  });
}
