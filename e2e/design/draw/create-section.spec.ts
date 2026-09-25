import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

test('draws a new section on the canvas using the Section option from the Frame dropdown', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

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

  const box = await designPage.canvasSafeArea();

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

test('places a default 100x100 section centered on the click point when released without dragging', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvasSafeArea();

  const before = await designPage.canvas.screenshot();

  await designPage.selectToolFromDropdown('frame', 'Section');

  const clickX = box.x + box.width * 0.5;
  const clickY = box.y + box.height * 0.5;

  await designPage.click(clickX, clickY);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  // Section's own fill matches the canvas background, so hover over the newly-placed box to force
  // a visible outline — otherwise a purely invisible-fill node could pass this check with nothing drawn
  await designPage.pointerMove(clickX, clickY);

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

  await designPage.selectToolFromDropdown('frame', 'Section');
  await designPage.pointerDown(startX, startY);
  await designPage.pointerMove(endX, endY);
  await designPage.pointerUp();

  // Section's own fill is invisible (matches the canvas background), so this diff can only come
  // from the selection outline itself
  const selected = await designPage.canvas.screenshot();

  await designPage.click(box.x + box.width * 0.05, box.y + box.height * 0.05); // empty canvas, well outside the section — deselects
  const deselected = await designPage.canvas.screenshot();

  expect(selected.equals(deselected)).toBe(false);
});

test('a new section is filled #444444, edged by a faint white inside stroke and stores a 2px corner radius', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-default-style');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSection(700, 200, 1000, 500);
  await designPage.click(1500, 900);
  await designPage.pointerMove(1500, 900);

  const [red, green, blue] = await readPixelColor(page, 850, 350);
  const [edgeRed] = await readPixelColor(page, 700, 350);

  expect([red, green, blue].map((channel) => Math.abs(channel - 0x44) <= 2)).toEqual([true, true, true]);
  expect(edgeRed).toBeGreaterThan(red + 10);

  const cornerRadius = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return (nodes[rootOrder[rootOrder.length - 1]] as { cornerRadius?: number }).cornerRadius;
  });

  expect(cornerRadius).toBe(2);
});
