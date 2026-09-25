import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const EMPTY_POINT = { x: 1200, y: 600 };

const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

const isColor = (actual: [number, number, number], expected: [number, number, number]): boolean =>
  actual.every((channel, index) => Math.abs(channel - expected[index]) <= 2);

test('a page without its own background follows the theme: #535353 in dark mode and #F5F5F5 in light mode', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-page-background-theme');
  await expect(designPage.canvas).toBeVisible();

  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
  });
  await expect.poll(async () => isColor(await readPixelColor(page, EMPTY_POINT.x, EMPTY_POINT.y), [0x53, 0x53, 0x53])).toBe(true);

  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
  });
  await expect.poll(async () => isColor(await readPixelColor(page, EMPTY_POINT.x, EMPTY_POINT.y), [0xf5, 0xf5, 0xf5])).toBe(true);
});

test('a new page takes the background set on the page it was created from, and keeps the theme default otherwise', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-page-background-inherit');
  await expect(designPage.canvas).toBeVisible();

  const backgrounds = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addPage, setBackgroundPaint } = await import('/src/store/design/slice.ts');
    const readActiveBackground = (): unknown => store.getState().design.pages[store.getState().design.activePageId].backgroundPaint;

    store.dispatch(addPage());
    const fromDefault = readActiveBackground();

    store.dispatch(setBackgroundPaint({ color: '#123456', opacity: 100, type: 'solid' }));
    store.dispatch(addPage());
    const fromCustom = readActiveBackground();

    return { fromCustom, fromDefault };
  });

  expect(backgrounds).toEqual({ fromCustom: { color: '#123456', opacity: 100, type: 'solid' }, fromDefault: null });
});
