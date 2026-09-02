import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TDesignSnapshot = { nodes: Record<string, { x1?: number; x2?: number; y1?: number; y2?: number }>; rootOrder: string[] };

const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId } = store.getState().design;
    const { nodes, rootOrder } = store.getState().design.pages[activePageId];

    return { nodes, rootOrder };
  });

test('holding Shift while drawing a line snaps it to the nearest 15° angle instead of the raw pointer position', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-angle-snap-shift');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('rectangle', 'Line');
  await designPage.pointerDown(900, 300); // raw target (1000,320) is ~11.3° off horizontal
  await page.keyboard.down('Shift');
  await designPage.pointerMove(1000, 320);
  await designPage.pointerUp();
  await page.keyboard.up('Shift');

  const { nodes, rootOrder } = await readDesignState(page);
  const line = nodes[rootOrder[rootOrder.length - 1]];

  // snapped onto the 15° line through (900,300) instead of the raw (1000,320) endpoint
  expect(line.x1).toBe(900);
  expect(line.y1).toBe(300);
  expect(line.x2).not.toBe(1000);
  expect(line.y2).not.toBe(320);
});

test('a Shift-drawn line ends at a different point than the identical free-drawn drag', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-angle-snap-free');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('rectangle', 'Line');
  await designPage.pointerDown(900, 300);
  await designPage.pointerMove(1000, 320);
  await designPage.pointerUp();

  const { nodes: freeNodes, rootOrder: freeRootOrder } = await readDesignState(page);
  const freeLine = freeNodes[freeRootOrder[freeRootOrder.length - 1]];

  await designPage.goto('e2e-test-line-angle-snap-shift-compare');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('rectangle', 'Line');
  await page.keyboard.down('Shift');
  await designPage.pointerDown(900, 300);
  await designPage.pointerMove(1000, 320); // identical drag, but Shift forces the 15° snap
  await designPage.pointerUp();
  await page.keyboard.up('Shift');

  const { nodes: shiftNodes, rootOrder: shiftRootOrder } = await readDesignState(page);
  const shiftLine = shiftNodes[shiftRootOrder[shiftRootOrder.length - 1]];

  expect(shiftLine.x2).not.toBe(freeLine.x2);
  expect(shiftLine.y2).not.toBe(freeLine.y2);
});

test('an Arrow tool drag also snaps to the 15° angle while Shift is held, reusing the same Line drawing hook', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-angle-snap-arrow');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('rectangle', 'Arrow');
  await designPage.pointerDown(900, 300);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(1000, 320);
  await designPage.pointerUp();
  await page.keyboard.up('Shift');

  const { nodes, rootOrder } = await readDesignState(page);
  const arrow = nodes[rootOrder[rootOrder.length - 1]];

  expect(arrow.x2).not.toBe(1000);
  expect(arrow.y2).not.toBe(320);
});

test('pressing Shift mid-drag snaps the line immediately, with zero further pointer movement', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-angle-snap-immediate');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('rectangle', 'Line');
  await designPage.pointerDown(900, 300);
  await designPage.pointerMove(1000, 320);
  const beforeShift = await designPage.canvas.screenshot();

  // Shift held, the cursor never moves — the snap must apply on keydown itself
  await page.keyboard.down('Shift');
  const afterShift = await designPage.canvas.screenshot();

  expect(afterShift.equals(beforeShift)).toBe(false);

  // releasing Shift, still without moving the mouse, re-evaluates back to the free-form endpoint
  await page.keyboard.up('Shift');
  const afterRelease = await designPage.canvas.screenshot();

  await designPage.pointerUp();

  expect(afterRelease.equals(afterShift)).toBe(false);
  expect(afterRelease.equals(beforeShift)).toBe(true);
});
