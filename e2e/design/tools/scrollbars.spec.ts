import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// draws a frame large enough that a few zoom-in steps push its on-screen extent past the viewport
// on both axes, then deselects — leaving genuine overflow for the scrollbars to represent
const setUpOverflow = async (designPage: DesignPage, page: Page): Promise<void> => {
  await designPage.drawFrame(600, 200, 1000, 600);
  await designPage.click(1500, 700); // deselect so the selection outline doesn't affect the screenshot
  await page.keyboard.press('Control+Equal');
  await page.keyboard.press('Control+Equal');
  await page.keyboard.press('Control+Equal');
};

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

test('the scrollbars stay hidden while all content fits within the view', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-scrollbar-hidden');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(850, 450, 950, 550); // small, centered, nowhere near an edge
  await designPage.click(1500, 700);

  await expect(page.locator('[class*="horizontal-thumb"]')).toBeHidden();
  await expect(page.locator('[class*="vertical-thumb"]')).toBeHidden();
});

test('dragging the horizontal scrollbar thumb pans the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-scrollbar-horizontal');
  await expect(designPage.canvas).toBeVisible();

  await setUpOverflow(designPage, page);

  const thumb = page.locator('[class*="horizontal-thumb"]');

  await expect(thumb).toBeVisible();

  const before = await designPage.canvas.screenshot();

  await dragThumb(page, thumb, 200, 0);

  const after = await designPage.canvas.screenshot();

  expect(after.equals(before)).toBe(false);
});

test('dragging the vertical scrollbar thumb pans the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-scrollbar-vertical');
  await expect(designPage.canvas).toBeVisible();

  await setUpOverflow(designPage, page);

  const thumb = page.locator('[class*="vertical-thumb"]');

  await expect(thumb).toBeVisible();

  const before = await designPage.canvas.screenshot();

  await dragThumb(page, thumb, 0, 150);

  const after = await designPage.canvas.screenshot();

  expect(after.equals(before)).toBe(false);
});

test('the thumb stays under the cursor for the whole drag, even when the overflow it represents goes away mid-gesture', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-scrollbar-hold');
  await expect(designPage.canvas).toBeVisible();

  // a small frame, then pan it partly off the right edge — content fits the view but isn't all in it
  await designPage.drawFrame(1000, 400, 1300, 500);
  await designPage.click(1500, 700);
  await designPage.panBy(500, 0);

  const thumb = page.locator('[class*="horizontal-thumb"]');

  await expect(thumb).toBeVisible();

  const box = await thumb.boundingBox();

  if (!box) {
    throw new Error('horizontal scrollbar thumb bounding box unavailable');
  }

  // drag it far enough left that the frame is pulled fully back into view (overflow would clear) —
  // but keep the button held and check the thumb is still there
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 700, box.y + box.height / 2, { steps: 10 });

  await expect(thumb).toBeVisible();

  await page.mouse.up();
});
