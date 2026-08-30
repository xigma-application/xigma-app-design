import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test.describe.configure({ mode: 'serial' });

// v1(900,300) -> v2(1000,300) -> v3(1000,400) -> v4(900,400) -> back onto v1, closing the loop —
// same shape/coordinates as vector-cut.spec.ts's own drawClosedSquare, kept local so this file has
// no cross-file dependency.
const drawClosedSquare = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 300 },
    { x: 1000, y: 400 },
    { x: 900, y: 400 },
    { x: 900, y: 300 },
  ]);
};

const readEditedVectorNode = (page: import('@playwright/test').Page): Promise<{ rootOrder: number; segmentCount: number }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const [id] = state.design.vectorEditingNodeIds;

    return {
      rootOrder: state.design.pages[state.design.activePageId].rootOrder.length,
      segmentCount: Object.keys(state.design.pages[state.design.activePageId].nodes[id].segments).length,
    };
  });

const readFillState = (page: import('@playwright/test').Page): Promise<{ filledFaceKeys: string[]; segmentCount: number }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const [id] = state.design.vectorEditingNodeIds;
    const node = state.design.pages[state.design.activePageId].nodes[id] as {
      filledFaceKeys?: string[];
      segments: Record<string, unknown>;
    };

    return { filledFaceKeys: node.filledFaceKeys ?? [], segmentCount: Object.keys(node.segments).length };
  });

test("pressing 'Shift+E' switches the active tool to Erase while a node is open for editing", async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-erase-shortcut-in-edit-mode');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+E');

  const activeTool = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.activeTool;
  });

  expect(activeTool).toBe('erase');
});

test('dragging the eraser across the middle of an edge splits it into two stubs, opening a gap — without splitting the node', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-erase-mid-edge-gap');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();

  const before = await readEditedVectorNode(page);
  expect(before.segmentCount).toBe(4);

  await page.keyboard.press('Shift+E');

  // the geometry must NOT change while the brush is still moving — only a preview is drawn
  await page.mouse.move(935, 300);
  await page.mouse.down();
  await page.mouse.move(950, 300, { steps: 4 });
  const midDrag = await readEditedVectorNode(page);
  expect(midDrag.segmentCount).toBe(4);
  await page.mouse.move(965, 300, { steps: 4 });
  await page.mouse.up();

  const after = await readEditedVectorNode(page);

  // the top edge is now two stubs (4 -> 5), and the node was NOT split into a second layer
  expect(after.segmentCount).toBe(5);
  expect(after.rootOrder).toBe(before.rootOrder);

  // the tool stays selected for the next stroke
  const activeTool = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.activeTool;
  });

  expect(activeTool).toBe('erase');
});

test('a wider brush (grown with "]") erases more of the edge in one pass', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-erase-bracket-diameter');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+E');

  // grow the brush from its default 10px up to ~25px, then take a single dab on the top edge
  for (let press = 0; press < 15; press += 1) {
    await page.keyboard.press(']');
  }

  await designPage.dragVectorPoint(950, 300, 950, 300);

  const after = await readEditedVectorNode(page);
  const gapWidth = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const [id] = state.design.vectorEditingNodeIds;
    const node = state.design.pages[state.design.activePageId].nodes[id];
    const xs = Object.values(node.vertices as Record<string, { x: number; y: number }>)
      .filter((vertex) => Math.abs(vertex.y - 300) < 1 && vertex.x > 900 && vertex.x < 1000)
      .map((vertex) => vertex.x)
      .sort((a, b) => a - b);

    return xs.length === 2 ? xs[1] - xs[0] : 0;
  });

  expect(after.segmentCount).toBe(5);
  // a ~30px brush leaves a noticeably wider gap than the 10px default would
  expect(gapWidth).toBeGreaterThan(15);
});

test('erasing a dip through a filled edge carves a channel — the fill survives instead of vanishing', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-erase-preserves-fill-on-boundary-bite');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');
  await designPage.click(950, 350); // paint the whole square
  await designPage.selectVectorEditMoveTool();

  const before = await readFillState(page);
  expect(before.filledFaceKeys.length).toBeGreaterThan(0);

  await page.keyboard.press('Shift+E');
  // a real boolean subtract: dip the brush down through the top edge into the interior and back out,
  // the same "U-shaped channel" reported live — a sever-and-drop model would delete the whole fill here
  await designPage.dragEraseBrush([
    { x: 950, y: 285 },
    { x: 950, y: 340 },
    { x: 950, y: 285 },
  ]);

  const after = await readFillState(page);

  // the fill survives the boundary bite instead of disappearing …
  expect(after.filledFaceKeys.length).toBeGreaterThan(0);
  // … and new wall segments were actually carved along the channel, not a no-op
  expect(after.segmentCount).toBeGreaterThan(4);
});
