import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const dragThumb = async (page: Page, thumb: Locator, dx: number, dy: number): Promise<void> => {
  const box = await thumb.boundingBox();

  if (!box) {
    throw new Error('scrollbar thumb bounding box unavailable');
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dx, startY + dy, { steps: 5 });
  await page.mouse.up();
};

test('dragging the horizontal scrollbar thumb pans the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-scrollbar-horizontal');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 900, 400);
  await designPage.click(1500, 700); // deselect so the selection outline doesn't affect the screenshot

  const before = await designPage.canvas.screenshot();

  await dragThumb(page, page.locator('[class*="horizontal-thumb"]'), 200, 0);

  const after = await designPage.canvas.screenshot();

  expect(after.equals(before)).toBe(false);
});

test('dragging the vertical scrollbar thumb pans the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-scrollbar-vertical');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 900, 400);
  await designPage.click(1500, 700); // deselect so the selection outline doesn't affect the screenshot

  const before = await designPage.canvas.screenshot();

  await dragThumb(page, page.locator('[class*="vertical-thumb"]'), 0, 150);

  const after = await designPage.canvas.screenshot();

  expect(after.equals(before)).toBe(false);
});
