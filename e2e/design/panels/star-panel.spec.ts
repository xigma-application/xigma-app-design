import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(await page.screenshot({ clip: { height: 1, width: 1, x, y } }));

  return [png.data[0], png.data[1], png.data[2]];
};

const updateStar = (page: Page, changes: Record<string, unknown>): Promise<void> =>
  page.evaluate(async (nodeChanges) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    store.dispatch(updateNode({ changes: nodeChanges as never, id: rootOrder[rootOrder.length - 1] }));
  }, changes);

test('a star stroke is drawn inside its outline by default and outside when its position says so', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-star-stroke');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawStar(800, 300, 1000, 500);
  await updateStar(page, { strokeWidth: 20, strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });
  await designPage.click(1500, 900);

  await expect.poll(() => readPixelColor(page, 900, 430)).toEqual([255, 0, 0]);
  expect(await readPixelColor(page, 900, 446)).not.toEqual([255, 0, 0]);

  await updateStar(page, { strokeAlign: 'outside' });

  await expect.poll(() => readPixelColor(page, 900, 446)).toEqual([255, 0, 0]);
  expect(await readPixelColor(page, 900, 430)).not.toEqual([255, 0, 0]);
});

test('a selected star shows the Star panel whose Count, Ratio and Corner radius reshape it on the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);
  const starArea = { height: 200, width: 200, x: 800, y: 300 };

  await designPage.goto('e2e-test-star-panel');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawStar(800, 300, 1000, 500);

  const count = page.getByRole('textbox', { name: 'Count' });
  const ratio = page.getByRole('textbox', { name: 'Ratio' });
  const cornerRadius = page.getByRole('textbox', { name: 'Corner radius' });

  await expect(page.getByText('Star', { exact: true }).first()).toBeVisible();
  await expect(count).toHaveValue('5');
  await expect(ratio).toHaveValue('38.2%');

  await designPage.click(1500, 900);
  const star = await page.screenshot({ clip: starArea });
  await designPage.click(900, 400);

  await count.fill('8');
  await count.press('Tab');
  await ratio.fill('60');
  await ratio.press('Tab');
  await cornerRadius.fill('10');
  await cornerRadius.press('Tab');

  const node = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[rootOrder.length - 1]] as unknown as Record<string, unknown>;
  });

  expect(node).toMatchObject({ cornerRadius: 10, points: 8, ratio: 0.6 });
  await expect(ratio).toHaveValue('60%');

  await page.getByLabel('More actions').click();
  await expect(page.getByText('Edit object')).toBeVisible();
  await expect(page.getByText('Offset vector')).toBeVisible();
  await page.keyboard.press('Escape');

  await designPage.click(1500, 900);
  await expect.poll(async () => (await page.screenshot({ clip: starArea })).equals(star)).toBe(false);
});

test('Offset vector previews the filled offset shape around a star and turns it into that vector on confirm', async ({ page }) => {
  const designPage = new DesignPage(page);
  const aboveStar = { height: 10, width: 10, x: 895, y: 270 };

  await designPage.goto('e2e-test-star-offset-vector');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawStar(800, 300, 1000, 500);

  const blank = await page.screenshot({ clip: aboveStar });

  await page.getByRole('button', { name: 'More actions' }).first().click();
  await page.getByText('Offset vector', { exact: true }).click();

  const distance = page.getByRole('textbox', { name: 'Offset distance' });

  await distance.fill('30');
  await distance.press('Tab');

  await expect(page.getByText('Offset', { exact: true })).toBeVisible();
  await expect.poll(async () => (await page.screenshot({ clip: aboveStar })).equals(blank)).toBe(false);

  await page.getByLabel('Confirm').click();
  await expect(page.getByText('Offset', { exact: true })).toHaveCount(0);

  const vector = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[rootOrder.length - 1]] as unknown as {
      defaultFill: unknown[];
      type: string;
      vertices: Record<string, { y: number }>;
    };
  });
  const ys = Object.values(vector.vertices).map(({ y }) => y);

  expect(vector.type).toBe('vector');
  expect(vector.defaultFill).toHaveLength(1);
  expect(Object.keys(vector.vertices)).toHaveLength(10);
  expect(Math.min(...ys)).toBeLessThan(270);

  await designPage.click(1500, 900);
  await expect.poll(async () => (await page.screenshot({ clip: aboveStar })).equals(blank)).toBe(false);
});
