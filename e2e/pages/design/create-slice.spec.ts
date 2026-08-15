import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('draws a new slice on the canvas using the Slice option from the Frame dropdown, staying on the Slice tool afterwards', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const before = await designPage.canvas.screenshot();

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.drawSlice(startX, startY, endX, endY);

  // unlike Frame/Section, the Slice tool stays active once a box exists, so it can be resized
  const sliceTool = designPage.toolRadio('slice');
  await expect(sliceTool).toHaveAttribute('aria-checked', 'true');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('draws a new slice on the canvas using the plain "S" shortcut, distinct from Section\'s "Shift+S"', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  await page.keyboard.press('S');

  const sliceTool = designPage.toolRadio('slice');
  await expect(sliceTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  await expect(sliceTool).toHaveAttribute('aria-checked', 'true');
});

test('places a default 100x100 slice centered on the click point when released without dragging', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const before = await designPage.canvas.screenshot();

  await designPage.selectToolFromDropdown('frame', 'Slice');

  const clickX = box.x + box.width * 0.5;
  const clickY = box.y + box.height * 0.5;

  await designPage.click(clickX, clickY);

  // unlike a discarded too-small draw, a click still places a default box and stays on-tool
  const sliceTool = designPage.toolRadio('slice');
  await expect(sliceTool).toHaveAttribute('aria-checked', 'true');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('resizes the slice box by dragging its corner handle', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.5;
  const endY = box.y + box.height * 0.5;

  await designPage.drawSlice(startX, startY, endX, endY);

  const afterDraw = await designPage.canvas.screenshot();

  // action - drag the just-drawn "se" corner handle further out
  await designPage.pointerDown(endX, endY);
  await designPage.pointerMove(endX + box.width * 0.1, endY + box.height * 0.1);
  await designPage.pointerUp();

  const afterResize = await designPage.canvas.screenshot();

  expect(afterResize.equals(afterDraw)).toBe(false);

  const sliceTool = designPage.toolRadio('slice');
  await expect(sliceTool).toHaveAttribute('aria-checked', 'true');
});

test('discards the slice and reverts to the default tool when clicking outside it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  // clipped to the canvas's upper region, clear of the floating toolbar docked at the bottom —
  // that toolbar's own icon can change (the Frame group button starts showing Slice's icon once
  // it's been used) even though nothing was drawn to the canvas itself
  const contentClip = { height: box.height * 0.5, width: box.width, x: box.x, y: box.y };
  const before = await page.screenshot({ clip: contentClip });

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.4;
  const endY = box.y + box.height * 0.4;

  await designPage.drawSlice(startX, startY, endX, endY);

  // action - click far outside the drawn box, but still within the clipped upper region
  await designPage.click(box.x + box.width * 0.9, box.y + box.height * 0.1);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const sliceTool = designPage.toolRadio('slice');
  await expect(sliceTool).toHaveAttribute('aria-checked', 'false');

  // nothing was ever persisted, so the canvas content returns to exactly its pre-draw pixels
  const after = await page.screenshot({ clip: contentClip });
  expect(after.equals(before)).toBe(true);
});
