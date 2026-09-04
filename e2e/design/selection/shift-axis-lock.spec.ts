import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TDesignSnapshot = { nodes: Record<string, { x?: number; y?: number }>; rootOrder: string[] };

const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId } = store.getState().design;
    const { nodes, rootOrder } = store.getState().design.pages[activePageId];

    return { nodes, rootOrder };
  });

test('holding Shift mid-drag locks a single element to the horizontal axis', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-axis-lock-single-x');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 350);
  await designPage.click(950, 325);

  // Shift is pressed once the drag is already under way — pressing it before pointerdown would
  // instead hit the existing shift-click "toggle selection membership" resolver
  await designPage.pointerDown(950, 325);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(1020, 355); // predominantly horizontal
  await designPage.pointerUp();
  await page.keyboard.up('Shift');

  const { nodes, rootOrder } = await readDesignState(page);
  const node = nodes[rootOrder[rootOrder.length - 1]];

  expect(node.x).toBe(970); // 900 + (1020-950)
  expect(node.y).toBe(300); // untouched
});

test('holding Shift mid-drag locks a single element to the vertical axis', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-axis-lock-single-y');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 350);
  await designPage.click(950, 325);

  await designPage.pointerDown(950, 325);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(955, 400); // predominantly vertical
  await designPage.pointerUp();
  await page.keyboard.up('Shift');

  const { nodes, rootOrder } = await readDesignState(page);
  const node = nodes[rootOrder[rootOrder.length - 1]];

  expect(node.x).toBe(900); // untouched
  expect(node.y).toBe(375); // 300 + (400-325)
});

test('a Shift-axis-locked drag ends at a different position than the identical free drag', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-axis-lock-free-compare');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 350);
  await designPage.click(950, 325);
  await designPage.pointerDown(950, 325);
  await designPage.pointerMove(1020, 355);
  await designPage.pointerUp();

  const { nodes: freeNodes, rootOrder: freeRootOrder } = await readDesignState(page);
  const freeNode = freeNodes[freeRootOrder[freeRootOrder.length - 1]];

  await designPage.goto('e2e-test-shift-axis-lock-locked-compare');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 350);
  await designPage.click(950, 325);

  await designPage.pointerDown(950, 325);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(1020, 355);
  await designPage.pointerUp();
  await page.keyboard.up('Shift');

  const { nodes: lockedNodes, rootOrder: lockedRootOrder } = await readDesignState(page);
  const lockedNode = lockedNodes[lockedRootOrder[lockedRootOrder.length - 1]];

  expect(lockedNode.y).not.toBe(freeNode.y);
});

test('holding Shift mid-drag locks every member of a multi-selection to the same axis', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-axis-lock-multi');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 950, 350);
  await designPage.selectTool('default');
  await designPage.drawRectangle(1000, 300, 1050, 350);
  await designPage.selectTool('default');

  const { nodes: nodesBefore, rootOrder } = await readDesignState(page);
  const [idA, idB] = rootOrder;

  expect(nodesBefore).toHaveProperty([idA, 'x'], 900);
  expect(nodesBefore).toHaveProperty([idB, 'x'], 1000);

  await designPage.click(925, 325);
  await designPage.click(1025, 325, { shift: true });

  // start the drag off A's dead centre so it clears the Smart Selection swap handle that the
  // [A, B] multi-selection puts there
  await designPage.pointerDown(910, 310);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(980, 400); // predominantly vertical, same (70, 90) delta
  await designPage.pointerUp();
  await page.keyboard.up('Shift');

  const { nodes: nodesAfter } = await readDesignState(page);

  // x untouched on both members (the locked axis), y shifted by the same 90px on both
  expect(nodesAfter[idA]).toMatchObject({ x: 900, y: 390 });
  expect(nodesAfter[idB]).toMatchObject({ x: 1000, y: 390 });
});

test('engages the axis lock the instant Shift goes down mid-drag, without waiting for the next pointer move', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-axis-lock-key-only');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 350);
  await designPage.click(950, 325);

  await designPage.pointerDown(950, 325);
  await designPage.pointerMove(1020, 355); // predominantly horizontal — establishes the drag

  // Shift down with the pointer held perfectly still: the lock and its cursor must engage off the
  // key event alone (a synthetic pointermove at the last position), not sit dormant until the
  // pointer twitches again
  await page.keyboard.down('Shift');
  expect(await designPage.cursorClassName()).toContain('move-x');

  // Shift up, still no pointer movement: the lock must release just as promptly
  await page.keyboard.up('Shift');
  expect(await designPage.cursorClassName()).not.toContain('move-x');

  await designPage.pointerUp();

  const { nodes, rootOrder } = await readDesignState(page);
  const node = nodes[rootOrder[rootOrder.length - 1]];

  expect(node.x).toBe(970); // 900 + (1020-950)
  expect(node.y).toBe(330); // free again on release: 300 + (355-325)
});

test('shows the move-x/move-y cursor class only while axis-locked, and clears it again on release', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-axis-lock-cursor');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 350);
  await designPage.click(950, 325);

  await designPage.pointerDown(950, 325);
  await designPage.pointerMove(1020, 355); // predominantly horizontal
  expect(await designPage.cursorClassName()).not.toContain('move-x');

  await page.keyboard.down('Shift');
  await designPage.pointerMove(1021, 355);
  expect(await designPage.cursorClassName()).toContain('move-x');

  await page.keyboard.up('Shift');
  await designPage.pointerMove(1022, 355);
  expect(await designPage.cursorClassName()).not.toContain('move-x');

  await page.keyboard.down('Shift');
  await designPage.pointerMove(1022, 425); // now predominantly vertical
  expect(await designPage.cursorClassName()).toContain('move-y');

  await designPage.pointerUp();
  await page.keyboard.up('Shift');
  expect(await designPage.cursorClassName()).not.toContain('move-y');
});
