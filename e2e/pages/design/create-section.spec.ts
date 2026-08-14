import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('draws a new section on the canvas using the Section option from the Frame dropdown', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const before = await designPage.canvas.screenshot();

  await designPage.selectToolFromDropdown('frame', 'Section');

  const sectionTool = designPage.toolRadio('section');
  await expect(sectionTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  await expect(sectionTool).toBeVisible();
  await expect(sectionTool).toHaveAttribute('aria-checked', 'false');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('draws a new section on the canvas using the Shift+S shortcut', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  await page.keyboard.down('Shift');
  await page.keyboard.press('S');
  await page.keyboard.up('Shift');

  const sectionTool = designPage.toolRadio('section');
  await expect(sectionTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');
});
