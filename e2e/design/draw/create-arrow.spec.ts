import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

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

test('Outline stroke on an arrow keeps its arrowhead in the outlined shape', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-arrow-outline-stroke');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawLine(780, 260, 1000, 260);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(updateNode({ changes: { endPoint: 'arrow', stroke: '#000000' }, id: pages[activePageId].rootOrder[0] }));
  });
  await page.keyboard.press('Alt+Control+O');
  await designPage.click(1500, 900);

  const wingArea = { height: 3, width: 4, x: 994, y: 255 };
  const blank = await page.screenshot({ clip: { ...wingArea, x: 1300, y: 700 } });
  const wing = await page.screenshot({ clip: wingArea });
  const type = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[0]].type;
  });

  expect(type).toBe('vector');
  expect(wing.equals(blank)).toBe(false);
});
