import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('shows the Rectangle panel with a Dimensions row and no auto-layout rows when a rectangle is selected', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rectangle-panel');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 900, 360); // auto-selected once drawn

  await expect(page.getByText('Rectangle', { exact: true })).toBeVisible();
  await expect(page.getByText('Dimensions', { exact: true })).toBeVisible();
  await expect(page.getByText('Flow', { exact: true })).toHaveCount(0);
});

test('editing the width field from the Rectangle panel resizes the shape on the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rectangle-panel-width');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320); // auto-selected once drawn

  const safeArea = await designPage.canvasSafeArea();
  const before = await page.screenshot({ clip: safeArea });

  const widthInput = page.locator('[data-test-text-field-input="width"]');

  await widthInput.click();
  await widthInput.fill('320');
  await widthInput.press('Enter');

  const after = await page.screenshot({ clip: safeArea });

  expect(after.equals(before)).toBe(false);
});
