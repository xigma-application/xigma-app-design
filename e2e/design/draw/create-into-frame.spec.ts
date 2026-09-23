import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readNodeIds = (page: Page): Promise<string[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return Object.keys(pages[activePageId].nodes);
  });

// a node parented into a frame never touches rootOrder, so the "most recently created node" can
// only be found by diffing the full node-id set before/after a draw, not by reading rootOrder
const readNewNodeId = async (page: Page, before: string[]): Promise<string> => {
  const after = await readNodeIds(page);
  const beforeSet = new Set(before);
  const newId = after.find((id) => !beforeSet.has(id));

  if (!newId) {
    throw new Error('No new node id found');
  }

  return newId;
};

const readNode = (page: Page, nodeId: string): Promise<Record<string, unknown>> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes[id] as unknown as Record<string, unknown>;
  }, nodeId);

const setLayoutMode = (page: Page, frameId: string, changes: Record<string, unknown>): Promise<void> =>
  page.evaluate(
    async ({ frameId, changes }) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(updateNode({ changes: changes as never, id: frameId }));
    },
    { changes, frameId },
  );

test.describe('Design draw tools — drawing into a frame', () => {
  test('a rectangle drawn with pointer-down inside a freeform frame becomes its child', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-draw-into-freeform-frame');
    await expect(designPage.canvas).toBeVisible();

    const before = await readNodeIds(page);
    await designPage.drawFrame(700, 100, 1200, 500);
    const frameId = await readNewNodeId(page, before);

    const beforeRect = await readNodeIds(page);
    await designPage.drawRectangle(800, 200, 900, 300);
    const rectId = await readNewNodeId(page, beforeRect);

    const rect = await readNode(page, rectId);
    const frame = (await readNode(page, frameId)) as { childIds: string[] };

    expect(rect.parentId).toBe(frameId);
    expect(frame.childIds).toContain(rectId);
  });

  test('a rectangle drawn inside a frame nested inside another frame becomes a child of the inner one', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-draw-into-nested-frame');
    await expect(designPage.canvas).toBeVisible();

    const beforeOuter = await readNodeIds(page);
    await designPage.drawFrame(700, 100, 1400, 700);
    const outerId = await readNewNodeId(page, beforeOuter);

    const beforeInner = await readNodeIds(page);
    await designPage.drawFrame(800, 200, 1000, 400);
    const innerId = await readNewNodeId(page, beforeInner);
    const innerAfterCreate = await readNode(page, innerId);

    expect(innerAfterCreate.parentId).toBe(outerId);

    const beforeRect = await readNodeIds(page);
    await designPage.drawRectangle(850, 250, 950, 350);
    const rectId = await readNewNodeId(page, beforeRect);
    const rect = await readNode(page, rectId);

    expect(rect.parentId).toBe(innerId);
  });

  test('a section drawn over a frame is never parented into it', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-draw-into-frame-section-excluded');
    await expect(designPage.canvas).toBeVisible();

    const beforeFrame = await readNodeIds(page);
    await designPage.drawFrame(700, 100, 1200, 500);
    const frameId = await readNewNodeId(page, beforeFrame);

    const beforeSection = await readNodeIds(page);
    await designPage.drawSection(800, 200, 900, 300);
    const sectionId = await readNewNodeId(page, beforeSection);
    const section = await readNode(page, sectionId);

    expect(section.parentId).toBeNull();
    expect(sectionId).not.toBe(frameId);
  });

  test('rectangles drawn into a horizontal auto-layout frame insert at the index under the cursor', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-draw-into-horizontal-frame');
    await expect(designPage.canvas).toBeVisible();

    const beforeFrame = await readNodeIds(page);
    await designPage.drawFrame(700, 100, 1300, 300);
    const frameId = await readNewNodeId(page, beforeFrame);
    await setLayoutMode(page, frameId, { layoutMode: 'horizontal' });

    // first child — the frame is empty, so it always lands at index 0
    const beforeFirst = await readNodeIds(page);
    await designPage.drawRectangle(750, 150, 850, 250);
    const firstId = await readNewNodeId(page, beforeFirst);

    // second click well to the right of the first child — must insert after it
    const beforeSecond = await readNodeIds(page);
    await designPage.drawRectangle(1200, 150, 1250, 200);
    const secondId = await readNewNodeId(page, beforeSecond);

    // third click well to the left of the first child — must insert before it
    const beforeThird = await readNodeIds(page);
    await designPage.drawRectangle(710, 150, 760, 200);
    const thirdId = await readNewNodeId(page, beforeThird);

    const frame = (await readNode(page, frameId)) as { childIds: string[] };

    expect(frame.childIds).toEqual([thirdId, firstId, secondId]);
  });

  test('a rectangle drawn onto an occupied grid cell shifts the existing occupant instead of overlapping it', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-draw-into-grid-frame');
    await expect(designPage.canvas).toBeVisible();

    const beforeFrame = await readNodeIds(page);
    await designPage.drawFrame(700, 100, 900, 300);
    const frameId = await readNewNodeId(page, beforeFrame);
    await setLayoutMode(page, frameId, { gridAutoPlacement: true, gridColumnCount: 2, layoutMode: 'grid' });

    // first rectangle lands in the first free cell
    const beforeOccupant = await readNodeIds(page);
    await designPage.drawRectangle(710, 110, 750, 150);
    const occupantId = await readNewNodeId(page, beforeOccupant);

    // second rectangle drawn at the exact same point must shift the occupant to the next cell
    const beforeNew = await readNodeIds(page);
    await designPage.drawRectangle(710, 110, 750, 150);
    const newId = await readNewNodeId(page, beforeNew);

    const occupant = (await readNode(page, occupantId)) as { gridColumnAnchorIndex: number; gridRowAnchorIndex: number };
    const newNode = (await readNode(page, newId)) as { gridColumnAnchorIndex: number; gridRowAnchorIndex: number };
    const frame = (await readNode(page, frameId)) as { gridAutoPlacement: boolean };

    expect(frame.gridAutoPlacement).toBe(false);
    expect([occupant.gridColumnAnchorIndex, occupant.gridRowAnchorIndex]).not.toEqual([
      newNode.gridColumnAnchorIndex,
      newNode.gridRowAnchorIndex,
    ]);
  });
});
