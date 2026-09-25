import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const ellipseArea = { height: 200, width: 200, x: 800, y: 300 };

const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(await page.screenshot({ clip: { height: 1, width: 1, x, y } }));

  return [png.data[0], png.data[1], png.data[2]];
};

const readEllipse = (page: Page): Promise<Record<string, unknown>> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[rootOrder.length - 1]] as unknown as Record<string, unknown>;
  });

test('a selected ellipse shows the Ellipse panel, and typed Arc values cut and hollow it on the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-ellipse-panel-arc');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawEllipse(800, 300, 1000, 500);

  const start = page.getByRole('textbox', { name: 'Start' });
  const sweep = page.getByRole('textbox', { name: 'Sweep' });
  const ratio = page.getByRole('textbox', { name: 'Ratio' });

  await expect(page.getByText('Arc', { exact: true })).toBeVisible();
  await expect(sweep).toHaveValue('100%');

  await designPage.click(1500, 900);
  const full = await page.screenshot({ clip: ellipseArea });
  await designPage.click(900, 400);

  await sweep.fill('50');
  await sweep.press('Tab');
  await ratio.fill('40');
  await ratio.press('Tab');
  await start.fill('45');
  await start.press('Tab');

  await expect(sweep).toHaveValue('50%');
  await expect(ratio).toHaveValue('40%');
  await expect(start).toHaveValue('45°');
  expect(await readEllipse(page)).toMatchObject({ arcRatio: 0.4, arcStartAngle: 135 });

  await designPage.click(1500, 900);
  await expect.poll(async () => (await page.screenshot({ clip: ellipseArea })).equals(full)).toBe(false);
});

test('a corner radius typed for an ellipse arc rounds its corners on the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-ellipse-panel-corner-radius');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawEllipse(800, 300, 1000, 500);

  const sweep = page.getByRole('textbox', { name: 'Sweep' });
  const cornerRadius = page.getByRole('textbox', { name: 'Corner radius' });

  await sweep.fill('25');
  await sweep.press('Tab');
  await designPage.click(1500, 900);
  const sharp = await page.screenshot({ clip: ellipseArea });
  await designPage.click(960, 340);

  await cornerRadius.fill('40');
  await cornerRadius.press('Tab');

  expect(await readEllipse(page)).toMatchObject({ cornerRadius: 40 });

  await designPage.click(1500, 900);
  await expect.poll(async () => (await page.screenshot({ clip: ellipseArea })).equals(sharp)).toBe(false);
});

test('an ellipse takes a second fill and a drop shadow from its panel and draws both', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-ellipse-panel-paints');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawEllipse(800, 300, 1000, 500);

  await expect(page.getByText('Fill', { exact: true })).toBeVisible();
  await expect(page.getByText('Effects', { exact: true })).toBeVisible();

  const shadowArea = { height: 20, width: 120, x: 840, y: 500 };
  await designPage.click(1500, 900);
  const plain = await page.screenshot({ clip: shadowArea });
  await designPage.click(900, 400);

  await page.getByLabel('Add fill').click();
  await page.getByLabel('Add effect').click();
  await page.getByText('Drop shadow', { exact: true }).last().click();

  expect(await readEllipse(page)).toMatchObject({ effects: [{ type: 'dropShadow' }] });
  expect(((await readEllipse(page)).fills as unknown[]).length).toBe(2);

  await designPage.click(1500, 900);
  await expect.poll(async () => (await page.screenshot({ clip: shadowArea })).equals(plain)).toBe(false);
});

test('a stroke added to a cut ellipse follows its shape, fills its corners and moves with its position', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-ellipse-panel-stroke');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawEllipse(800, 300, 1000, 500);

  const sweep = page.getByRole('textbox', { name: 'Sweep' });

  await sweep.fill('75');
  await sweep.press('Tab');
  await page.getByLabel('Add stroke').click();
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    store.dispatch(
      updateNode({
        changes: { strokeWidth: 20, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] },
        id: rootOrder[rootOrder.length - 1],
      }),
    );
  });

  await expect(page.getByRole('textbox', { name: 'Stroke weight' })).toHaveValue('20');

  await designPage.click(1500, 900);

  const cornerInBand = await readPixelColor(page, 992, 396);
  const inside = await page.screenshot({ clip: { height: 240, width: 240, x: 780, y: 280 } });

  expect(cornerInBand.every((channel) => channel < 60)).toBe(true);

  await designPage.click(900, 330);
  await page.getByText('Inside', { exact: true }).click();
  await page.locator('[class*="DropdownOption__label"]', { hasText: 'Outside' }).click();
  expect(await readEllipse(page)).toMatchObject({ strokeAlign: 'outside' });

  await designPage.click(1500, 900);
  await expect.poll(async () => (await page.screenshot({ clip: { height: 240, width: 240, x: 780, y: 280 } })).equals(inside)).toBe(false);
});
