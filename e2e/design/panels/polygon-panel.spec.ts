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

test('a selected polygon shows the Polygon panel whose Count and Corner radius reshape it on the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);
  const polygonArea = { height: 200, width: 200, x: 800, y: 300 };

  await designPage.goto('e2e-test-polygon-panel');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawPolygon(800, 300, 1000, 500);

  const count = page.getByRole('textbox', { name: 'Count' });
  const cornerRadius = page.getByRole('textbox', { name: 'Corner radius' });

  await expect(page.getByText('Polygon', { exact: true }).first()).toBeVisible();
  await expect(count).toHaveValue('3');

  await designPage.click(1500, 900);
  const triangle = await page.screenshot({ clip: polygonArea });
  await designPage.click(900, 420);

  await count.fill('6');
  await count.press('Tab');
  await cornerRadius.fill('20');
  await cornerRadius.press('Tab');

  const polygon = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[rootOrder.length - 1]] as unknown as Record<string, unknown>;
  });

  expect(polygon).toMatchObject({ cornerRadius: 20, sides: 6 });

  await page.getByLabel('More actions').click();
  await expect(page.getByText('Edit object')).toBeVisible();
  await expect(page.getByText('Offset vector')).toBeVisible();
  await page.keyboard.press('Escape');

  await designPage.click(1500, 900);
  await expect.poll(async () => (await page.screenshot({ clip: polygonArea })).equals(triangle)).toBe(false);
});

test('Offset vector previews the filled offset shape around a polygon and turns it into that vector on confirm', async ({ page }) => {
  const designPage = new DesignPage(page);
  const belowPolygon = { height: 4, width: 20, x: 890, y: 466 };

  await designPage.goto('e2e-test-polygon-offset-vector');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawPolygon(800, 300, 1000, 500);

  const blank = await page.screenshot({ clip: belowPolygon });

  await page.getByRole('button', { name: 'More actions' }).first().click();
  await page.getByText('Offset vector', { exact: true }).click();

  const distance = page.getByRole('textbox', { name: 'Offset distance' });

  await distance.fill('30');
  await distance.press('Tab');

  await expect(page.getByText('Offset', { exact: true })).toBeVisible();
  await expect.poll(async () => (await page.screenshot({ clip: belowPolygon })).equals(blank)).toBe(false);

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
  expect(Math.max(...ys)).toBeCloseTo(480, 0);

  await designPage.click(1500, 900);
  await expect.poll(async () => (await page.screenshot({ clip: belowPolygon })).equals(blank)).toBe(false);
});

test('in Offset vector the polygon shows only its outline and dragging the pink outline out grows the distance', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-offset-drag');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawPolygon(800, 300, 1000, 500);

  await page.getByRole('button', { name: 'More actions' }).first().click();
  await page.getByText('Offset vector', { exact: true }).click();

  const distance = page.getByRole('textbox', { name: 'Offset distance' });

  await distance.fill('30');
  await distance.press('Tab');
  await expect(distance).toHaveValue('30');

  const isOutlineBlue = async (): Promise<boolean> => {
    const colors = await Promise.all([449, 450, 451].map((y) => readPixelColor(page, 900, y)));
    return colors.some(([red, , blue]) => blue - red > 60);
  };

  await designPage.pointerMove(1500, 900);
  await expect.poll(isOutlineBlue).toBe(true);

  await designPage.pointerMove(900, 481);
  await designPage.pointerDown(900, 481);
  await page.mouse.move(900, 521, { steps: 5 });
  await designPage.pointerUp();

  await expect(distance).toHaveValue('70');

  await designPage.pointerDown(1000, 500);
  await page.mouse.move(1100, 600, { steps: 5 });
  await designPage.pointerUp();

  const polygon = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[rootOrder.length - 1]] as unknown as Record<string, unknown>;
  });

  expect(polygon).toMatchObject({ height: 200, type: 'polygon', width: 200, x: 800, y: 300 });
  await expect(distance).toHaveValue('70');
});
