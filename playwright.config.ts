import { defineConfig, devices } from '@playwright/test';

const blockedHosts = [
  'googletagmanager.com',
  'cloud.umami.is',
  'unpkg.com',
];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

export async function blockExternalCdn(page: import('@playwright/test').Page) {
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (blockedHosts.some((host) => url.includes(host))) {
      return route.abort();
    }
    return route.continue();
  });
}
