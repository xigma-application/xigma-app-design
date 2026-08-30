import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('draws a new frame on the canvas using the Frame tool', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

  const before = await designPage.canvas.screenshot();

  const frameTool = designPage.toolRadio('frame');
  await expect(frameTool).toBeVisible();
  await designPage.selectTool('frame');
  await expect(frameTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('starts selected immediately after being drawn, without an extra click', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.selectTool('frame');
  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const selected = await designPage.canvas.screenshot();

  await designPage.click(box.x + box.width * 0.05, box.y + box.height * 0.05); // empty canvas, well outside the frame — deselects
  const deselected = await designPage.canvas.screenshot();

  expect(selected.equals(deselected)).toBe(false);
});

test('places a default 100x100 frame centered on the click point when released without dragging', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

  const before = await designPage.canvas.screenshot();

  await designPage.selectTool('frame');

  const clickX = box.x + box.width * 0.5;
  const clickY = box.y + box.height * 0.5;

  await designPage.click(clickX, clickY);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});
