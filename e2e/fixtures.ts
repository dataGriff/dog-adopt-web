import { test as base, expect, type Page } from '@playwright/test';
import { defaultHandler } from '../src/test/apiHandlers';
import { FAKE_API } from '../playwright.config';

/** Answers every request to the fake API host from the shared fixture handler. */
async function mockApi(page: Page) {
  await page.route(`${FAKE_API}/**`, async (route) => {
    const response = defaultHandler(new URL(route.request().url()), undefined);
    if (!response) return route.fulfill({ status: 404, body: `Unhandled in e2e: ${route.request().url()}` });
    await route.fulfill({
      status: response.status,
      headers: { ...Object.fromEntries(response.headers), 'access-control-allow-origin': '*' },
      body: await response.text(),
    });
  });
}

export const test = base.extend({
  // Playwright calls the second argument "use"; it is not a React hook.
  page: async ({ page }, provide) => {
    await mockApi(page);
    await provide(page);
  },
});

export { expect };
