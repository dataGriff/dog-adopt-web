import AxeBuilder from '@axe-core/playwright';
import { BELLA, CARDIFF, page as pageOf } from '../src/test/fixtures';
import { expect, test } from './fixtures';

const WIDTHS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 375, height: 812 },
] as const;

// Each page, and something on it that only renders once its data has loaded.
const PAGES = [
  { name: 'home', path: '/', ready: '[data-testid="dog-card"]' },
  { name: 'filtered home', path: '/?size=Small&goodWithCats=true', ready: '[data-testid="active-filters"]' },
  { name: 'dog', path: `/dogs/${BELLA.id}`, ready: 'h1' },
  { name: 'rescues', path: '/rescues', ready: '[data-testid="rescue-card"]' },
  { name: 'rescue', path: `/rescues/${CARDIFF.id}`, ready: '[data-testid="dog-card"]' },
  { name: 'about', path: '/about', ready: 'h1' },
  { name: 'unknown dog', path: '/dogs/00000000-0000-4000-8000-000000000000', ready: 'h1:has-text("find that dog")' },
  { name: 'not found', path: '/no-such-page', ready: 'h1' },
] as const;

for (const viewport of WIDTHS) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const p of PAGES) {
      test(`${p.name} passes axe (WCAG 2.2 A/AA) and does not scroll sideways`, async ({ page }) => {
        await page.goto(p.path);
        await page.locator(p.ready).first().waitFor();

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(summary, 'axe violations').toEqual([]);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
      });
    }

    test('the first Tab stop is the skip link, and it moves focus to the content below the header', async ({ page }) => {
      await page.goto(`/dogs/${BELLA.id}`);
      await page.locator('h1').waitFor();
      // Start scrolled down, so the skip link has to scroll the content back into view.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('main#main')).toBeFocused();

      const headerBottom = await page.locator('header').evaluate((el) => el.getBoundingClientRect().bottom);
      const mainTop = await page.locator('main#main').evaluate((el) => el.getBoundingClientRect().top);
      expect(mainTop, 'main content must not start under the sticky header').toBeGreaterThanOrEqual(headerBottom);
    });
  });
}

test.describe('phone layout', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('dogs come first: filters are collapsed and the first card is within a screen of the hero', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('[data-testid="dog-card"]').first();
    await card.waitFor();
    await expect(page.locator('#filters-panel')).toBeHidden();
    const heroBottom = await page.locator('.bg-hero').evaluate((el) => el.getBoundingClientRect().bottom);
    const cardTop = await card.evaluate((el) => el.getBoundingClientRect().top);
    expect(cardTop - heroBottom).toBeLessThan(812);

    await page.getByRole('button', { name: /Filters/ }).click();
    await expect(page.locator('#filters-panel')).toBeVisible();
    await expect(page.getByLabel('Size')).toBeVisible();
  });

  test('dog page action buttons keep their full height', async ({ page }) => {
    await page.goto(`/dogs/${BELLA.id}`);
    const buttons = page.locator('[aria-labelledby="rescue-heading"] a[target="_blank"]');
    await expect(buttons.first()).toBeVisible();
    for (const box of await buttons.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()))) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });
});

// Real listings are not as tidy as the fixtures: unbroken words in names,
// breeds and searches must wrap rather than push the page sideways.
const LONG_WORD = 'Wigglebottom-Snuffleupagus'.replace('-', '') + 'Fluffington';
const LONG_DOG = {
  ...BELLA,
  id: '0f0f0f0f-0f0f-4f0f-8f0f-0f0f0f0f0f0f',
  name: `Sir${LONG_WORD}`,
  breeds: [`Staffordshirebullterrierxlabradorretriever${LONG_WORD}`],
  rescue: { ...BELLA.rescue, name: `TheExtraordinarilyLongRescueOrganisation${LONG_WORD}` },
};
const LONG_SEARCH = 'staffordshirebullterrierxlabradorretrievercrossbreedpuppyavailable0123456789';

test.describe('long content', () => {
  for (const viewport of WIDTHS) {
    test.describe(`${viewport.name} (${viewport.width}px)`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test.beforeEach(async ({ page }) => {
        // Registered after the shared mock, so these answers take precedence.
        await page.route('http://api.dogadopt.test/v1/dogs?*', (route) =>
          route.fulfill({ status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(pageOf([LONG_DOG, BELLA])) }),
        );
        await page.route(`http://api.dogadopt.test/v1/dogs/${LONG_DOG.id}`, (route) =>
          route.fulfill({ status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(LONG_DOG) }),
        );
      });

      test('a long search and long dog names do not scroll the home page sideways', async ({ page }) => {
        await page.goto(`/?q=${LONG_SEARCH}&size=Small`);
        await page.locator('[data-testid="active-filters"]').waitFor();
        await expect(page.getByText(LONG_DOG.name)).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
      });

      test('a long dog name does not scroll the dog page sideways', async ({ page }) => {
        await page.goto(`/dogs/${LONG_DOG.id}`);
        await page.locator('h1').waitFor();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
      });
    });
  }
});

test.describe('phone menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('the skip link clears the header even while the menu is open', async ({ page }) => {
    await page.goto(`/dogs/${BELLA.id}`);
    await page.locator('h1').waitFor();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('#mobile-nav')).toBeVisible();

    await page.getByRole('link', { name: 'Skip to content' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();

    const headerBottom = await page.locator('header').evaluate((el) => el.getBoundingClientRect().bottom);
    const mainTop = await page.locator('main#main').evaluate((el) => el.getBoundingClientRect().top);
    expect(headerBottom, 'the open menu makes the header taller than its usual 65px').toBeGreaterThan(100);
    expect(mainTop, 'main content must not start under the open header').toBeGreaterThanOrEqual(headerBottom);
  });
});
