import { defineConfig, devices } from '@playwright/test';

// The built site is served by `vite preview` and pointed at a fake API host;
// e2e/fixtures.ts answers every request to that host from the same
// contract-validated fixtures the unit tests use, so no API needs to run.
export const FAKE_API = 'http://api.dogadopt.test';
const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `vite build && vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: { VITE_API_BASE_URL: FAKE_API },
    timeout: 120_000,
  },
});
