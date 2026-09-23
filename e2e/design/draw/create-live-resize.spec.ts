import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readNodeIds = (page: Page): Promise<string[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return Object.keys(pages[activePageId].nodes);
  });

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

test.describe('Design draw tools — live node creation while drawing', () => {
  test('a rectangle already exists in the tree right after pointer-down, before the drag finishes', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-live-create-on-pointer-down');
    await expect(designPage.canvas).toBeVisible();

    const before = await readNodeIds(page);

    await designPage.selectTool('rectangle');
    await designPage.pointerDown(700, 300);

    // result — a real node already exists mid-gesture, before any move or release
    const nodeId = await readNewNodeId(page, before);
    const node = await readNode(page, nodeId);

    expect(node.type).toBe('rectangle');

    await designPage.pointerMove(800, 400);
    await designPage.pointerUp();
  });

  test('drawing a wide rectangle into a horizontal auto-layout frame pushes the sibling live, mid-drag', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-live-reflow-horizontal-frame');
    await expect(designPage.canvas).toBeVisible();

    const beforeFrame = await readNodeIds(page);
    await designPage.drawFrame(700, 100, 1300, 300);
    const frameId = await readNewNodeId(page, beforeFrame);
    await setLayoutMode(page, frameId, { layoutMode: 'horizontal' });

    const beforeSibling = await readNodeIds(page);
    await designPage.drawRectangle(750, 150, 800, 200);
    const siblingId = await readNewNodeId(page, beforeSibling);
    const siblingBeforeDraw = (await readNode(page, siblingId)) as { x: number };

    // start drawing a second rectangle before the existing sibling, then drag it wide
    const beforeNew = await readNodeIds(page);

    await designPage.selectTool('rectangle');
    await designPage.pointerDown(710, 150);

    const newId = await readNewNodeId(page, beforeNew);

    await designPage.pointerMove(1000, 250);

    // result — the sibling has already been pushed right, before pointer-up ever fires
    const siblingMidDrag = (await readNode(page, siblingId)) as { x: number };

    expect(siblingMidDrag.x).toBeGreaterThan(siblingBeforeDraw.x);

    await designPage.pointerUp();

    const siblingAfterDraw = (await readNode(page, siblingId)) as { x: number };
    const newNode = (await readNode(page, newId)) as { parentId: string | null };

    expect(newNode.parentId).toBe(frameId);
    expect(siblingAfterDraw.x).toBe(siblingMidDrag.x);
  });

  test('a rectangle drawn onto an occupied grid cell shifts the occupant immediately at pointer-down', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-live-reflow-grid-frame');
    await expect(designPage.canvas).toBeVisible();

    const beforeFrame = await readNodeIds(page);
    await designPage.drawFrame(700, 100, 900, 300);
    const frameId = await readNewNodeId(page, beforeFrame);
    await setLayoutMode(page, frameId, { gridAutoPlacement: true, gridColumnCount: 2, layoutMode: 'grid' });

    const beforeOccupant = await readNodeIds(page);
    await designPage.drawRectangle(710, 110, 750, 150);
    const occupantId = await readNewNodeId(page, beforeOccupant);
    const occupantBefore = (await readNode(page, occupantId)) as { gridColumnAnchorIndex: number };

    const beforeNew = await readNodeIds(page);

    await designPage.selectTool('rectangle');
    await designPage.pointerDown(710, 110);

    const newId = await readNewNodeId(page, beforeNew);

    // result — the occupant has already moved to the next cell right after pointer-down, before
    // any move or release
    const occupantAfterDown = (await readNode(page, occupantId)) as { gridColumnAnchorIndex: number };

    expect(occupantAfterDown.gridColumnAnchorIndex).not.toBe(occupantBefore.gridColumnAnchorIndex);

    await designPage.pointerMove(750, 150);
    await designPage.pointerUp();

    const newNode = (await readNode(page, newId)) as { parentId: string | null };

    expect(newNode.parentId).toBe(frameId);
  });

  test('pressing Escape mid-drag deletes the in-progress shape and returns to the default tool', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-live-escape-cancel');
    await expect(designPage.canvas).toBeVisible();

    const before = await readNodeIds(page);

    await designPage.selectTool('rectangle');
    await designPage.pointerDown(700, 300);
    await designPage.pointerMove(800, 400);

    // sanity check — the shape really was created before Escape cancels it, so the assertion
    // below proves a cancellation, not just that nothing ever happened
    await readNewNodeId(page, before);

    await page.keyboard.press('Escape');

    // result — the node created at pointer-down is gone, not left orphaned in the tree
    const after = await readNodeIds(page);

    expect(after).toEqual(before);

    await designPage.pointerUp();

    const afterRelease = await readNodeIds(page);

    expect(afterRelease).toEqual(before);
  });

  test('drawing a text box into a horizontal auto-layout frame parents it and pushes the sibling live, mid-drag', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-live-reflow-text-frame');
    await expect(designPage.canvas).toBeVisible();

    const beforeFrame = await readNodeIds(page);
    await designPage.drawFrame(700, 100, 1300, 300);
    const frameId = await readNewNodeId(page, beforeFrame);
    await setLayoutMode(page, frameId, { layoutMode: 'horizontal' });

    const beforeSibling = await readNodeIds(page);
    await designPage.drawRectangle(750, 150, 800, 200);
    const siblingId = await readNewNodeId(page, beforeSibling);
    const siblingBeforeDraw = (await readNode(page, siblingId)) as { x: number };

    // start drawing a text box before the existing sibling, then drag it wide
    const beforeText = await readNodeIds(page);

    await designPage.selectTool('text');
    await designPage.pointerDown(710, 150);

    const textId = await readNewNodeId(page, beforeText);

    await designPage.pointerMove(1000, 250);

    // result — the sibling has already been pushed right, before pointer-up ever fires
    const siblingMidDrag = (await readNode(page, siblingId)) as { x: number };

    expect(siblingMidDrag.x).toBeGreaterThan(siblingBeforeDraw.x);

    await designPage.pointerUp();

    const textNode = (await readNode(page, textId)) as { parentId: string | null };

    expect(textNode.parentId).toBe(frameId);
  });
});
