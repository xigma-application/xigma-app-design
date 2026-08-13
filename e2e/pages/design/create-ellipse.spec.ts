import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('draws a new ellipse on the canvas using the Ellipse option from the Rectangle dropdown', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const before = await designPage.canvas.screenshot();

  await designPage.selectToolFromDropdown('rectangle', 'Ellipse');

  const ellipseTool = designPage.toolRadio('ellipse');
  await expect(ellipseTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  // the shared rectangle/ellipse button now shows the ellipse icon, but stays unchecked once drawing finishes
  await expect(ellipseTool).toBeVisible();
  await expect(ellipseTool).toHaveAttribute('aria-checked', 'false');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('draws an ellipse with the "O" keyboard shortcut', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const before = await designPage.canvas.screenshot();

  await page.keyboard.press('o');

  const ellipseTool = designPage.toolRadio('ellipse');
  await expect(ellipseTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test("shows the ellipse's fill live while dragging, unlike the fill-less Frame draft", async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.selectTool('frame');
  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  const frameMidDrag = await designPage.canvas.screenshot();
  await designPage.pointerUp();

  // reload for a clean canvas, then drag the exact same box with the Ellipse tool
  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await page.keyboard.press('o');
  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  const ellipseMidDrag = await designPage.canvas.screenshot();
  await designPage.pointerUp();

  // same box, same outline and corner handles — only the ellipse's own fill should differ them
  expect(ellipseMidDrag.equals(frameMidDrag)).toBe(false);
});
