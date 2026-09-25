import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(await page.screenshot({ clip: { height: 1, width: 1, x, y } }));

  return [png.data[0], png.data[1], png.data[2]];
};

const updatePolygon = (page: Page, changes: Record<string, unknown>): Promise<void> =>
  page.evaluate(async (nodeChanges) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    store.dispatch(updateNode({ changes: nodeChanges as never, id: rootOrder[rootOrder.length - 1] }));
  }, changes);

test('a polygon stroke is drawn inside its outline by default and outside when its position says so', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-stroke');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawPolygon(800, 300, 1000, 500);
  await updatePolygon(page, { strokeWidth: 20, strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });
  await designPage.click(1500, 900);

  await expect.poll(() => readPixelColor(page, 900, 440)).toEqual([255, 0, 0]);
  expect(await readPixelColor(page, 900, 460)).not.toEqual([255, 0, 0]);

  await updatePolygon(page, { strokeAlign: 'outside' });

  await expect.poll(() => readPixelColor(page, 900, 460)).toEqual([255, 0, 0]);
  expect(await readPixelColor(page, 900, 440)).not.toEqual([255, 0, 0]);
});
