import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('shows the Page background section only while nothing is selected', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-right-panel-background-selection');
  await expect(designPage.canvas).toBeVisible();

  await expect(page.getByText('Page', { exact: true })).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // auto-selected once drawn

  await expect(page.getByText('Page', { exact: true })).toHaveCount(0);

  await designPage.click(1500, 600); // deselect

  await expect(page.getByText('Page', { exact: true })).toBeVisible();
});

test('editing the hex field repaints the canvas background', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-right-panel-background-hex');
  await expect(designPage.canvas).toBeVisible();

  const safeArea = await designPage.canvasSafeArea();
  const before = await page.screenshot({ clip: safeArea });

  const hexInput = page.locator('[data-test-text-field-input="background-color"]');

  await hexInput.click();
  await hexInput.fill('336699');
  await hexInput.press('Enter');

  const after = await page.screenshot({ clip: safeArea });

  expect(after.equals(before)).toBe(false);
});

test('clicking the swatch opens the color picker popover and it stays open', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-right-panel-background-picker-open');
  await expect(designPage.canvas).toBeVisible();

  await page.getByLabel('Background color').click();

  const panel = page.locator('[class*="ColorPicker_"]').first();

  await expect(panel).toBeVisible();
  await page.waitForTimeout(300);
  await expect(panel).toBeVisible();
});

test('picking a preset color inside the open popover keeps it open and updates the hex field', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-right-panel-background-picker-pick');
  await expect(designPage.canvas).toBeVisible();

  await page.getByLabel('Background color').click();

  const panel = page.locator('[class*="ColorPicker_"]').first();

  await expect(panel).toBeVisible();

  const preset = page.locator('[class*="Footer__colors"] > div').first();

  await preset.click();

  // picking a color mutates the store, which re-renders the hex/alpha fields with a new value —
  // the popover must survive that re-render instead of being torn down along with it
  await expect(panel).toBeVisible();
  await expect(page.locator('[data-test-text-field-input="background-color"]')).not.toHaveValue('444444');
});

test('toggling the eye off then back on restores the original canvas background', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-right-panel-background-visibility');
  await expect(designPage.canvas).toBeVisible();

  const safeArea = await designPage.canvasSafeArea();
  const originallyVisible = await page.screenshot({ clip: safeArea });

  const toggle = page.getByLabel('Toggle background visibility');

  await toggle.click();

  const hidden = await page.screenshot({ clip: safeArea });

  expect(hidden.equals(originallyVisible)).toBe(false);

  await toggle.click();

  const restored = await page.screenshot({ clip: safeArea });

  expect(restored.equals(originallyVisible)).toBe(true);
});
