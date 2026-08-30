import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// v1 (900,300) -> v2 (1050,300) -> v3 (1050,450), all plain clicks (no curve), left open — leaves
// the canvas in Vector Edit Mode with the VectorEditToolbar visible, same as vector-edit.spec.ts's
// own helper. offsetX lets a single test draw a second, non-overlapping path.
const drawOpenTriangle = async (designPage: DesignPage, offsetX = 0): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900 + offsetX, y: 300 },
    { x: 1050 + offsetX, y: 300 },
    { x: 1050 + offsetX, y: 450 },
  ]);
};

test('picking Shape builder from the More dropdown swaps its label for the tool icon and activates it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-more-toolbar-pick');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);

  // action
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByText('Shape builder', { exact: true }).click();

  // result — the "More" label is gone (the trigger is now an icon-only button + a small chevron,
  // which keeps the "More" accessible name for the reopened dropdown but has no visible text)
  await expect(page.getByText('More', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Shape builder' })).toHaveAttribute('aria-pressed', 'true');
});

test('the "M" and "Shift+W" shortcuts activate Shape builder / Variable width and update the More slot', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-more-toolbar-shortcuts');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);

  // action
  await page.keyboard.press('m');

  // result
  await expect(page.getByRole('button', { name: 'Shape builder' })).toHaveAttribute('aria-pressed', 'true');

  // action
  await page.keyboard.press('Shift+w');

  // result
  await expect(page.getByRole('button', { name: 'Variable width' })).toHaveAttribute('aria-pressed', 'true');
});

test('closing Vector Edit Mode resets the More slot back to its label, even after a tool was picked', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-more-toolbar-reset');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByText('Shape builder', { exact: true }).click();

  // action
  await page.getByRole('button', { name: 'Close' }).click();
  await drawOpenTriangle(designPage, 300);

  // result
  await expect(page.getByRole('button', { name: 'More' })).toBeVisible();
});
