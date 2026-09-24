import { test, expect, Locator } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const dragRowOnto = async (from: Locator, to: Locator): Promise<void> => {
  const fromBox = await from.boundingBox();
  const toBox = await to.boundingBox();

  if (!fromBox || !toBox) {
    throw new Error('row bounding box unavailable');
  }

  const page = from.page();

  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });
  await page.mouse.up();
};

test('the Boolean operations button wraps a rectangle in a Union, a dropped rectangle joins it and a menu pick switches it to Subtract', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-operations');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await page.getByLabel('Boolean operations', { exact: true }).click();

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await expect(rows.filter({ hasText: 'Union' })).toHaveCount(1);
  await expect(page.locator('[data-test-component-header="boolean"]').getByText('Union', { exact: true })).toBeVisible();

  await designPage.drawRectangle(760, 260, 880, 380);
  await designPage.click(1500, 600);
  await expect(rows).toHaveCount(2);

  await dragRowOnto(rows.filter({ hasText: 'Rectangle' }), rows.filter({ hasText: 'Union' }));
  await expect(rows).toHaveCount(1);

  await page.getByRole('button', { name: 'Expand layer' }).click();
  await expect(rows.filter({ hasText: 'Rectangle' })).toHaveCount(2);

  await rows.filter({ hasText: 'Union' }).click();

  const safeArea = await designPage.canvasSafeArea();
  const unionShot = await page.screenshot({ clip: safeArea });

  await page.getByLabel('Boolean operations options').click();
  await page.getByText('Subtract', { exact: true }).click();

  await expect(page.locator('[data-test-component-header="boolean"]').getByText('Subtract', { exact: true })).toBeVisible();
  await expect(rows.filter({ hasText: 'Subtract' })).toHaveCount(1);

  const subtractShot = await page.screenshot({ clip: safeArea });

  expect(subtractShot.equals(unionShot)).toBe(false);
});

test('a frame dropped on a Union row stays outside it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-frame-drop');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await page.getByLabel('Boolean operations', { exact: true }).click();
  await designPage.drawFrame(1000, 200, 1100, 300);
  await designPage.click(1500, 600);

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await expect(rows).toHaveCount(2);

  await dragRowOnto(rows.filter({ hasText: 'Frame' }), rows.filter({ hasText: 'Union' }));

  await expect(rows).toHaveCount(2);
  await expect(rows.filter({ hasText: 'Frame' })).toHaveCount(1);
});

test('wrapping a rectangle in a Union keeps its fill color on the canvas instead of a per-face placeholder color', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-fill-color');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);

  const clip = { height: 100, width: 100, x: 710, y: 210 };
  const before = await page.screenshot({ clip });

  await page.getByLabel('Boolean operations', { exact: true }).click();
  await expect(page.locator('[data-test-component-header="boolean"]')).toBeVisible();

  const after = await page.screenshot({ clip });

  expect(after.equals(before)).toBe(true);
});

test('Flatten from the Boolean menu turns a Union into a single vector without children and keeps its look', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-flatten');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await page.getByLabel('Boolean operations', { exact: true }).click();
  await designPage.drawRectangle(760, 260, 880, 380);
  await designPage.click(1500, 600);

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await dragRowOnto(rows.filter({ hasText: 'Rectangle' }), rows.filter({ hasText: 'Union' }));
  await designPage.click(1500, 600);

  const clip = { height: 200, width: 200, x: 690, y: 190 };
  const before = await page.screenshot({ clip });

  await rows.filter({ hasText: 'Union' }).click();
  await page.getByLabel('Boolean operations options').click();
  await page.getByText('Flatten', { exact: true }).click();

  await expect(page.getByRole('button', { name: 'Expand layer' })).toHaveCount(0);
  await expect(page.locator('[data-test-component-header="boolean"]')).toHaveCount(0);

  await designPage.click(1500, 600);

  const after = await page.screenshot({ clip });

  expect(after.equals(before)).toBe(true);
});
