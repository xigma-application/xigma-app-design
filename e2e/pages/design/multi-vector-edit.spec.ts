import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

test.describe.configure({ mode: 'serial' });

// v1(x,y) -> v2(x+100,y) -> v3(x+100,y+100) -> v4(x,y+100) -> back onto v1, closing the loop —
// same shape as vector-edit.spec.ts's own drawClosedSquare, parameterized by its own top-left
// corner so several independent shapes can be laid out side by side on one canvas.
const drawClosedSquareAt = async (designPage: DesignPage, x: number, y: number): Promise<void> => {
  await designPage.drawVectorPath([
    { x, y },
    { x: x + 100, y },
    { x: x + 100, y: y + 100 },
    { x, y: y + 100 },
    { x, y },
  ]);
};

// mirrors vector-edit.spec.ts's own exitVectorEditMode — any main-toolbar tool switch outside the
// Pen group exits Vector Edit Mode in one go, leaving the node selected.
const exitVectorEditMode = async (designPage: DesignPage): Promise<void> => {
  await designPage.selectTool('default');
};

// the Phase 1 entry mechanism under test: plain-click the first point (replacing the selection),
// shift-click every other point (adding to it), then Enter opens every currently-selected vector
// node for editing at once (handleEnterMultiVectorEdit.ts).
const openMultipleViaEnter = async (designPage: DesignPage, page: Page, points: { x: number; y: number }[]): Promise<void> => {
  const [first, ...rest] = points;

  await designPage.click(first.x, first.y);

  for (const point of rest) {
    await designPage.click(point.x, point.y, { shift: true });
  }

  await page.keyboard.press('Enter');
};

type TDesignSnapshot = {
  nodes: Record<string, { filledFaceKeys?: string[]; type: string; vertices?: Record<string, { x: number; y: number }> }>;
  rootOrder: string[];
  vectorEditingNodeIds: string[];
};

const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { nodes, rootOrder, vectorEditingNodeIds } = store.getState().design;

    return { nodes, rootOrder, vectorEditingNodeIds };
  });

const hasVertexNear = (vertices: Record<string, { x: number; y: number }> | undefined, x: number, y: number): boolean =>
  Object.values(vertices ?? {}).some((vertex) => Math.abs(vertex.x - x) < 3 && Math.abs(vertex.y - y) < 3);

test('pressing Enter after selecting two vector nodes opens both for editing at once, rendering handles on both', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-enter-opens-both');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1200, 300); // B
  await exitVectorEditMode(designPage);

  await designPage.pointerMove(1400, 700); // rest away from either shape before capturing
  const beforeEnter = await designPage.canvas.screenshot();

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);
  await designPage.pointerMove(1400, 700); // rest again so only the committed edit-mode chrome differs
  const afterEnter = await designPage.canvas.screenshot();

  expect(afterEnter.equals(beforeEnter)).toBe(false);

  const { nodes, rootOrder, vectorEditingNodeIds } = await readDesignState(page);
  const [idA, idB] = rootOrder;

  expect(vectorEditingNodeIds.slice().sort()).toEqual([idA, idB].sort());
  expect(nodes[idA].type).toBe('vector');
  expect(nodes[idB].type).toBe('vector');
});

test('dragging a vertex on one open node moves only that node, leaving the sibling open node untouched', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-drag-independence');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1300, 300); // B, far enough away to rule out alignment-guide snapping
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1300, y: 300 },
  ]);

  await designPage.dragVectorPoint(900, 300, 850, 250); // A's own top-left vertex only

  const { nodes, rootOrder } = await readDesignState(page);
  const [idA, idB] = rootOrder;

  expect(hasVertexNear(nodes[idA].vertices, 850, 250)).toBe(true); // A actually moved
  expect(hasVertexNear(nodes[idA].vertices, 900, 300)).toBe(false); // and left its old spot
  expect(hasVertexNear(nodes[idB].vertices, 1300, 300)).toBe(true); // B's own corner never moved
});

test('a marquee drawn across two open nodes catches vertices from both, leaving vertices outside it untouched', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-marquee-union');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A, top edge at y=300
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1050, 300); // B, adjacent, top edge also at y=300
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
  ]);

  const aTopLeftRegion = { height: 24, width: 24, x: 888, y: 288 }; // A's (900,300)
  const bTopLeftRegion = { height: 24, width: 24, x: 1038, y: 288 }; // B's (1050,300)
  const aBottomLeftRegion = { height: 24, width: 24, x: 888, y: 388 }; // A's (900,400) — outside the box

  const beforeATop = await page.screenshot({ clip: aTopLeftRegion });
  const beforeBTop = await page.screenshot({ clip: bTopLeftRegion });
  const beforeABottom = await page.screenshot({ clip: aBottomLeftRegion });

  // spans y 250-320 — catches both squares' top-left corners, stays well clear of either bottom edge
  await designPage.dragVectorPoint(850, 250, 1200, 320);

  const afterATop = await page.screenshot({ clip: aTopLeftRegion });
  const afterBTop = await page.screenshot({ clip: bTopLeftRegion });
  const afterABottom = await page.screenshot({ clip: aBottomLeftRegion });

  expect(afterATop.equals(beforeATop)).toBe(false);
  expect(afterBTop.equals(beforeBTop)).toBe(false);
  expect(afterABottom.equals(beforeABottom)).toBe(true);
});

test('deleting vertices selected across two open nodes removes both in one gesture, and a single Undo restores both', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-grouped-delete-undo');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1300, 300); // B
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1300, y: 300 },
  ]);

  await designPage.click(900, 300); // select A's own top-left vertex
  await designPage.click(1300, 300, { shift: true }); // add B's own top-left vertex

  const before = await readDesignState(page);
  const [idA, idB] = before.rootOrder;
  const aVertexCountBefore = Object.keys(before.nodes[idA].vertices ?? {}).length;
  const bVertexCountBefore = Object.keys(before.nodes[idB].vertices ?? {}).length;

  await page.keyboard.press('Delete');

  const afterDelete = await readDesignState(page);

  expect(Object.keys(afterDelete.nodes[idA].vertices ?? {}).length).toBe(aVertexCountBefore - 1);
  expect(Object.keys(afterDelete.nodes[idB].vertices ?? {}).length).toBe(bVertexCountBefore - 1);

  await page.keyboard.press('Control+z'); // a single undo, since both deletions were one history gesture

  const afterUndo = await readDesignState(page);

  expect(Object.keys(afterUndo.nodes[idA].vertices ?? {}).length).toBe(aVertexCountBefore);
  expect(Object.keys(afterUndo.nodes[idB].vertices ?? {}).length).toBe(bVertexCountBefore);
});

test('pressing Escape while two nodes are open exits editing for both at once', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-escape-closes-both');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1200, 300); // B
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  expect((await readDesignState(page)).vectorEditingNodeIds).toHaveLength(2);

  await page.keyboard.press('Escape');

  expect((await readDesignState(page)).vectorEditingNodeIds).toEqual([]);
});

test('clicking exactly on another open node’s vertex with the Pen tool performs a real structural merge, not just a visual coincidence', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-pen-merge-vertex');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1200, 300); // B
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  const before = await readDesignState(page);
  const [idA, idB] = before.rootOrder;

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // activate A's own top-left vertex — no duplicate, just resumes it
  await designPage.click(1200, 300); // click exactly on B's own top-left vertex — real merge, not a drag

  const after = await readDesignState(page);

  expect(after.nodes[idB]).toBeUndefined(); // B absorbed and deleted outright
  expect(hasVertexNear(after.nodes[idA].vertices, 1200, 300)).toBe(true); // its whole graph lives on in A now
  expect(after.vectorEditingNodeIds).toEqual([idA]); // pruned from the open set
});

test('clicking on another open node’s segment with the Pen tool splits it and merges the two nodes into one', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-pen-merge-edge');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1200, 300); // B — its own top edge runs (1200,300)-(1300,300)
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  const before = await readDesignState(page);
  const [idA, idB] = before.rootOrder;
  const bVertexCountBefore = Object.keys(before.nodes[idB].vertices ?? {}).length;

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // activate A's own top-left vertex
  await designPage.click(1250, 300); // the exact midpoint of B's top edge — not a vertex

  const after = await readDesignState(page);

  expect(after.nodes[idB]).toBeUndefined(); // B absorbed and deleted outright
  expect(hasVertexNear(after.nodes[idA].vertices, 1250, 300)).toBe(true); // the new split point lives on in A
  // A gained B's original 4 vertices plus the 1 new split point, on top of its own original 4
  expect(Object.keys(after.nodes[idA].vertices ?? {})).toHaveLength(4 + bVertexCountBefore + 1);
  expect(after.vectorEditingNodeIds).toEqual([idA]);
});

test('hovering another open node’s vertex or segment with the Pen tool shows the snap/extend cursor before any click', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-pen-snap-preview');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1200, 300); // B
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // activate A's own top-left vertex, nothing committed onto B yet

  await designPage.pointerMove(1200, 300); // hover exactly on B's own top-left vertex
  expect(await designPage.cursorClassName()).toContain('pen-snap');

  // off B's own edge midpoint (1250,300), which would instead lock on as an 'edge-snap' (still pen-snap)
  await designPage.pointerMove(1280, 300);
  expect(await designPage.cursorClassName()).toContain('pen-extend');

  // nothing was actually clicked — B must still be its own separate, unmerged node
  const { nodes, rootOrder } = await readDesignState(page);
  const [, idB] = rootOrder;

  expect(nodes[idB]).toBeDefined();
});

test('clicking blank canvas with the Pen tool while several nodes are open creates a genuinely independent new vector, leaving the others untouched', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-pen-creates-vector-c');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1200, 300); // B
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  const before = await readDesignState(page);
  const [idA, idB] = before.rootOrder;
  const aVertexCountBefore = Object.keys(before.nodes[idA].vertices ?? {}).length;
  const bVertexCountBefore = Object.keys(before.nodes[idB].vertices ?? {}).length;

  await designPage.selectTool('pen');
  await designPage.click(900, 700); // genuinely blank space, nowhere near either A or B

  const after = await readDesignState(page);

  expect(after.rootOrder).toHaveLength(before.rootOrder.length + 1); // a real third node was created
  const idC = after.rootOrder[after.rootOrder.length - 1];

  expect(after.nodes[idC].type).toBe('vector');
  expect(hasVertexNear(after.nodes[idC].vertices, 900, 700)).toBe(true);
  // A and B are completely untouched — no stray contour tacked onto either one of them
  expect(Object.keys(after.nodes[idA].vertices ?? {})).toHaveLength(aVertexCountBefore);
  expect(Object.keys(after.nodes[idB].vertices ?? {})).toHaveLength(bVertexCountBefore);
  expect(after.vectorEditingNodeIds.slice().sort()).toEqual([idA, idB, idC].sort());
});

test('the Paint tool fills a face on the second, non-primary open node, not just the first', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-paint-second-node');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A — opened first, the "primary" node
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1200, 300); // B — opened second
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  await page.keyboard.press('Shift+B'); // Paint tool
  await designPage.click(1250, 350); // well inside B's own interior face

  const { nodes, rootOrder } = await readDesignState(page);
  const [idA, idB] = rootOrder;

  expect(nodes[idB].filledFaceKeys ?? []).not.toHaveLength(0);
  expect(nodes[idA].filledFaceKeys ?? []).toHaveLength(0); // A was never touched
});

test('Paint on two open nodes whose shapes overlap on screen fills the smaller, topmost node’s face under the cursor, not the bigger one it also sits inside — regression for getVectorFaceAtPointAcrossOpenNodes picking the first open node instead of the smallest face across all of them', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-paint-overlapping-nodes');
  await expect(designPage.canvas).toBeVisible();

  // A: a 200x200 square. B: a fully separate 100x100 square drawn entirely inside A's own on-screen
  // bounds — two different nodes overlapping on screen, unlike vector-edit.spec.ts's own single-node
  // nested-loops case. Opened directly via setVectorEditingNodeIds instead of the usual
  // openMultipleViaEnter click-shift-click flow: every one of B's own corners sits inside A's bounds
  // too, so a selection click aimed at "B's corner" is exactly as ambiguous as the paint click this
  // test is actually about — a separate concern from the fill hit-test fixed here
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 300 },
    { x: 1100, y: 500 },
    { x: 900, y: 500 },
    { x: 900, y: 300 },
  ]);
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 950, 350); // B, fully inside A's 900-1100 x 300-500 bounds
  await exitVectorEditMode(designPage);

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setVectorEditingNodeIds } = await import('/src/store/design/slice.ts');

    store.dispatch(setVectorEditingNodeIds(store.getState().design.rootOrder));
  });

  await page.keyboard.press('Shift+B'); // Paint tool
  await designPage.click(1000, 400); // dead center of B; also sits inside A's own face

  const { nodes, rootOrder } = await readDesignState(page);
  const [idA, idB] = rootOrder;

  expect(nodes[idB].filledFaceKeys ?? []).not.toHaveLength(0); // B, the smaller/topmost one, got filled
  expect(nodes[idA].filledFaceKeys ?? []).toHaveLength(0); // A was never touched
});

test('the multi-select box spans two open nodes at once and dragging its interior moves both together', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-box-cross-node-move');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await exitVectorEditMode(designPage);
  await drawClosedSquareAt(designPage, 1200, 300); // B
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  // marquee every vertex of both squares — the box's own bounds then span x:[900,1300], y:[300,400]
  await designPage.dragVectorPoint(850, 250, 1350, 450);

  const before = await readDesignState(page);
  const [idA, idB] = before.rootOrder;

  // drag from a point inside the box but on neither shape's own edges — the empty gap between them
  await designPage.dragVectorPoint(1150, 350, 1150, 500);

  const after = await readDesignState(page);

  // every vertex on both nodes shifted by the same (0, 150) delta
  expect(hasVertexNear(after.nodes[idA].vertices, 900, 450)).toBe(true);
  expect(hasVertexNear(after.nodes[idA].vertices, 900, 300)).toBe(false);
  expect(hasVertexNear(after.nodes[idB].vertices, 1200, 450)).toBe(true);
  expect(hasVertexNear(after.nodes[idB].vertices, 1200, 300)).toBe(false);
});

test('selecting a single segment (not its own vertices) makes the multi-select box eligible, and dragging it moves both endpoints together', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-vector-box-segment-eligible');
  await expect(designPage.canvas).toBeVisible();

  // a triangle, not a square — a square's own edges are all axis-aligned, so a single selected edge
  // would bound a zero-height/zero-width degenerate box with no interior to drag from at all
  await designPage.drawVectorPath([
    { x: 900, y: 300 }, // v1
    { x: 1000, y: 300 }, // v2
    { x: 950, y: 250 }, // v3 (apex)
    { x: 900, y: 300 }, // back onto v1, closing the loop
  ]);
  await exitVectorEditMode(designPage);

  await designPage.doubleClick(925, 275); // midpoint of the diagonal v1-v3 edge, entering Vector Edit Mode

  // shift-click that same edge midpoint — toggles segment selection instead of splitting on a plain click
  await designPage.click(925, 275, { shift: true });

  const before = await readDesignState(page);
  const [idA] = before.rootOrder;

  // the segment's own box is (900,250)-(950,300); drag from inside it, off the diagonal line itself
  await designPage.dragVectorPoint(920, 270, 920, 220);

  const after = await readDesignState(page);

  expect(hasVertexNear(after.nodes[idA].vertices, 900, 250)).toBe(true); // v1 (segment start) moved
  expect(hasVertexNear(after.nodes[idA].vertices, 950, 200)).toBe(true); // v3 (segment end) moved by the same delta
  expect(hasVertexNear(after.nodes[idA].vertices, 900, 300)).toBe(false); // v1 left its old spot
  expect(hasVertexNear(after.nodes[idA].vertices, 1000, 300)).toBe(true); // v2, not part of the segment, never moved
});
