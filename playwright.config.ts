/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

// @xigma
import { getAppUrl } from '@xigma/utils';

const baseURL = getAppUrl('xigma-app-design', 'development');

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { height: 1080, width: 1920 } },
    },
  ],
  reporter: 'html',
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: !process.env.CI,
    url: baseURL,
  },
});
