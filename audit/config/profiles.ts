export type GpuMode = 'native' | 'swiftshader' | 'disabled';
export type ExpectedPerfTier = 'full' | 'reduced' | 'minimal';
export type AuditBrowser = 'chromium' | 'webkit';

export type NetworkPreset = 'offline' | '3g' | 'slow4g' | 'fast4g' | 'cable' | 'none';

export interface AuditProfile {
  id: string;
  label: string;
  browser: AuditBrowser;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  cpuThrottleRate: number;
  network: NetworkPreset;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  webglRenderer?: string;
  gpuMode: GpuMode;
  expectedTier?: ExpectedPerfTier;
  /** Docker-only profile */
  docker?: { cpus: string; memory: string };
  skipEmulationNote?: string;
}

const WEBGL_INTEL = 'Intel Iris OpenGL Engine';

export function getProfilesForLevel(level: 'quick' | 'full'): AuditProfile[] {
  const quick: AuditProfile[] = [
    {
      id: 'desktop-full-hd',
      label: 'Desktop 1080p (dedicated GPU)',
      browser: 'chromium',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      cpuThrottleRate: 1,
      network: 'cable',
      hardwareConcurrency: 8,
      deviceMemory: 8,
      webglRenderer: 'NVIDIA GeForce RTX 3070',
      gpuMode: 'native',
      expectedTier: 'full',
    },
    {
      id: 'laptop-intel-reduced',
      label: 'Retina laptop Intel (reduced tier)',
      browser: 'chromium',
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: false,
      cpuThrottleRate: 1,
      network: 'fast4g',
      hardwareConcurrency: 8,
      deviceMemory: 8,
      webglRenderer: WEBGL_INTEL,
      gpuMode: 'native',
      expectedTier: 'reduced',
    },
    {
      id: 'budget-laptop-minimal',
      label: 'Budget laptop 1366×768 (minimal tier)',
      browser: 'chromium',
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      cpuThrottleRate: 1,
      network: 'slow4g',
      hardwareConcurrency: 4,
      deviceMemory: 4,
      webglRenderer: WEBGL_INTEL,
      gpuMode: 'native',
      expectedTier: 'minimal',
    },
  ];

  if (level === 'quick') return quick;

  const fullExtra: AuditProfile[] = [
    {
      id: 'desktop-1440p',
      label: 'Desktop 1440p',
      browser: 'chromium',
      viewport: { width: 2560, height: 1440 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      cpuThrottleRate: 1,
      network: 'cable',
      gpuMode: 'native',
      expectedTier: 'full',
    },
    {
      id: 'desktop-4k-2x',
      label: '4K @ 2x DPR',
      browser: 'chromium',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: false,
      cpuThrottleRate: 1,
      network: 'cable',
      gpuMode: 'native',
      expectedTier: 'full',
    },
    {
      id: 'ipad-webkit',
      label: 'iPad (WebKit)',
      browser: 'webkit',
      viewport: { width: 820, height: 1180 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      cpuThrottleRate: 1,
      network: 'fast4g',
      gpuMode: 'native',
      skipEmulationNote: 'CPU/network CDP emulation skipped on WebKit',
    },
    {
      id: 'android-mid-slow4g',
      label: 'Mid Android slow 4G',
      browser: 'chromium',
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      cpuThrottleRate: 2,
      network: 'slow4g',
      hardwareConcurrency: 6,
      deviceMemory: 4,
      gpuMode: 'native',
      expectedTier: 'minimal',
    },
    {
      id: 'android-low-3g',
      label: 'Low Android 3G 6× CPU',
      browser: 'chromium',
      viewport: { width: 360, height: 640 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      cpuThrottleRate: 6,
      network: '3g',
      hardwareConcurrency: 4,
      deviceMemory: 2,
      gpuMode: 'native',
      expectedTier: 'minimal',
    },
    {
      id: 'iphone-webkit',
      label: 'iPhone (WebKit)',
      browser: 'webkit',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      cpuThrottleRate: 1,
      network: 'fast4g',
      gpuMode: 'native',
      skipEmulationNote: 'CPU/network CDP emulation skipped on WebKit',
    },
    {
      id: 'desktop-swiftshader',
      label: 'Desktop SwiftShader',
      browser: 'chromium',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      cpuThrottleRate: 1,
      network: 'cable',
      gpuMode: 'swiftshader',
      expectedTier: 'reduced',
    },
    {
      id: 'docker-2cpu-2gb',
      label: 'Docker 2 CPU / 2 GB (SwiftShader)',
      browser: 'chromium',
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      cpuThrottleRate: 1,
      network: 'cable',
      gpuMode: 'swiftshader',
      docker: { cpus: '2', memory: '2g' },
      expectedTier: 'minimal',
    },
    {
      id: 'docker-1cpu-1gb',
      label: 'Docker 1 CPU / 1 GB (SwiftShader)',
      browser: 'chromium',
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      cpuThrottleRate: 1,
      network: 'cable',
      gpuMode: 'swiftshader',
      docker: { cpus: '1', memory: '1g' },
      expectedTier: 'minimal',
    },
  ];

  return [...quick, ...fullExtra];
}

export function filterProfiles(
  profiles: AuditProfile[],
  ids: string[] | undefined,
): AuditProfile[] {
  if (!ids?.length) return profiles;
  const set = new Set(ids);
  return profiles.filter((p) => set.has(p.id));
}
