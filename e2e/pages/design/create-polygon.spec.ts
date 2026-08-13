import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('draws a new polygon on the canvas using the Polygon option from the Rectangle dropdown', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

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

  // "p" is not bound to anything, so the active tool must stay the default one
  await page.keyboard.press('p');

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const polygonTool = designPage.toolRadio('polygon');
  await expect(polygonTool).toHaveCount(0);
});

test("shows the polygon's fill live while dragging, unlike the fill-less Frame draft", async ({ page }) => {
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

  // default polygon is a triangle (3 sides), apex up — bounding box (100,100)-(180,160)
  await designPage.drawPolygon(100, 100, 180, 160);

  await designPage.pointerMove(10, 10); // rest away first
  const baseline = await designPage.canvas.screenshot();

  await designPage.pointerMove(105, 105); // inside the bounding box, but outside the triangle (near its top-left corner)
  const atCorner = await designPage.canvas.screenshot();

  expect(atCorner.equals(baseline)).toBe(true);

  await designPage.pointerMove(140, 130); // the triangle's centroid, well inside its fill
  const insideShape = await designPage.canvas.screenshot();

  expect(insideShape.equals(baseline)).toBe(false);
});
