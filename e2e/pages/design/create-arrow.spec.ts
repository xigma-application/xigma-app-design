import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('draws a new arrow on the canvas using the Arrow option from the Rectangle dropdown', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

  const before = await designPage.canvas.screenshot();

  await designPage.selectToolFromDropdown('rectangle', 'Arrow');

  const arrowTool = designPage.toolRadio('arrow');
  await expect(arrowTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.5;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('renders an arrowhead at the drawn endpoint, so it looks different from an identical plain line', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a plain line drawn at the exact same coordinates, in a fresh page, is the reference
  await designPage.goto('e2e-test-arrow-vs-line-a');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();
  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.5;

  await designPage.selectToolFromDropdown('rectangle', 'Line');
  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();
  await designPage.click(box.x + box.width * 0.05, box.y + box.height * 0.9); // deselect, so the selection outline doesn't mask the diff
  const line = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-arrow-vs-line-b');
  await expect(designPage.canvas).toBeVisible();
  await designPage.selectToolFromDropdown('rectangle', 'Arrow');
  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();
  await designPage.click(box.x + box.width * 0.05, box.y + box.height * 0.9);
  const arrow = await designPage.canvas.screenshot();

  expect(arrow.equals(line)).toBe(false);
});

test('draws an arrow with the "Shift+L" keyboard shortcut', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

  const before = await designPage.canvas.screenshot();

  await page.keyboard.press('Shift+L');

  const arrowTool = designPage.toolRadio('arrow');
  await expect(arrowTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.5;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('pressing a plain "L" (no shift) still activates Line, not Arrow', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await page.keyboard.press('l');

  const lineTool = designPage.toolRadio('line');
  await expect(lineTool).toHaveAttribute('aria-checked', 'true');
});
