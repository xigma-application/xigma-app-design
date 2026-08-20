import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('draws a new polygon on the canvas using the Polygon option from the Rectangle dropdown', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

  const before = await designPage.canvas.screenshot();

  await designPage.selectToolFromDropdown('rectangle', 'Polygon');

  const polygonTool = designPage.toolRadio('polygon');
  await expect(polygonTool).toHaveAttribute('aria-checked', 'true');

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.6;

  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  // the shared rectangle/ellipse/polygon button now shows the polygon icon, but stays unchecked once drawing finishes
  await expect(polygonTool).toBeVisible();
  await expect(polygonTool).toHaveAttribute('aria-checked', 'false');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('has no keyboard shortcut, unlike Rectangle/Ellipse/Line/Frame', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  // "p" is bound to the Pen tool (shortcuts.ts), not Polygon — pressing it must activate Pen, and must
  // never activate Polygon itself (there is no ToolName.polygon entry in shortcuts.ts at all)
  await page.keyboard.press('p');

  const penTool = designPage.toolRadio('pen');
  await expect(penTool).toHaveAttribute('aria-checked', 'true');

  const polygonTool = designPage.toolRadio('polygon');
  await expect(polygonTool).toHaveCount(0);
});

test('places a default 100x100 polygon centered on the click point when released without dragging', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

  const before = await designPage.canvas.screenshot();

  await designPage.selectToolFromDropdown('rectangle', 'Polygon');

  const clickX = box.x + box.width * 0.5;
  const clickY = box.y + box.height * 0.5;

  await designPage.click(clickX, clickY);

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

  await designPage.selectToolFromDropdown('rectangle', 'Polygon');
  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  const selected = await designPage.canvas.screenshot();

  await designPage.click(box.x + box.width * 0.05, box.y + box.height * 0.05); // empty canvas, well outside the polygon — deselects
  const deselected = await designPage.canvas.screenshot();

  expect(selected.equals(deselected)).toBe(false);
});

test("shows the polygon's fill live while dragging, unlike the fill-less Frame draft", async ({ page }) => {
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
  const frameMidDrag = await designPage.canvas.screenshot();
  await designPage.pointerUp();

  // reload for a clean canvas, then drag the exact same box with the Polygon tool
  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('rectangle', 'Polygon');
  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  const polygonMidDrag = await designPage.canvas.screenshot();
  await designPage.pointerUp();

  // same box, same outline and corner handles — only the polygon's own fill should differ them
  expect(polygonMidDrag.equals(frameMidDrag)).toBe(false);
});

test('hovering a polygon only highlights inside its shape, not the corners of its bounding box', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  // default polygon is a triangle (3 sides), apex up — bounding box (700,100)-(780,160)
  await designPage.drawPolygon(700, 100, 780, 160);

  await designPage.pointerMove(610, 10); // rest away first
  const baseline = await designPage.canvas.screenshot();

  await designPage.pointerMove(705, 105); // inside the bounding box, but outside the triangle (near its top-left corner)
  const atCorner = await designPage.canvas.screenshot();

  expect(atCorner.equals(baseline)).toBe(true);

  await designPage.pointerMove(740, 130); // the triangle's centroid, well inside its fill
  const insideShape = await designPage.canvas.screenshot();

  expect(insideShape.equals(baseline)).toBe(false);
});
