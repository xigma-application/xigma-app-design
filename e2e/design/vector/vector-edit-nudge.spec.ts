import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test.describe.configure({ mode: 'serial' });

type TVectorSegment = {
  endId: string;
  startId: string;
  tangentEnd: { x: number; y: number } | null;
  tangentStart: { x: number; y: number } | null;
};
type TDesignSnapshot = {
  nodes: Record<string, { segments?: Record<string, TVectorSegment>; type: string; vertices?: Record<string, { x: number; y: number }> }>;
  rootOrder: string[];
};

const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId } = store.getState().design;
    const { nodes, rootOrder } = store.getState().design.pages[activePageId];

    return { nodes, rootOrder };
  });

const hasVertexNear = (vertices: Record<string, { x: number; y: number }> | undefined, x: number, y: number): boolean =>
  Object.values(vertices ?? {}).some((vertex) => Math.abs(vertex.x - x) < 3 && Math.abs(vertex.y - y) < 3);

const findVertexIdNear = (vertices: Record<string, { x: number; y: number }> | undefined, x: number, y: number): string => {
  const match = Object.entries(vertices ?? {}).find(([, vertex]) => Math.abs(vertex.x - x) < 3 && Math.abs(vertex.y - y) < 3);

  if (!match) {
    throw new Error(`no vertex near (${x}, ${y})`);
  }

  return match[0];
};

const drawClosedSquareAt = async (designPage: DesignPage, x: number, y: number): Promise<void> => {
  await designPage.drawVectorPath([
    { x, y },
    { x: x + 100, y },
    { x: x + 100, y: y + 100 },
    { x, y: y + 100 },
    { x, y },
  ]);
};

test('pressing the Right arrow key nudges the selected vertex by 1px, leaving the rest of the node untouched', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-nudge-vertex');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // v1(900,300) as drawn
  await designPage.selectVectorEditMoveTool();
  await designPage.dragVectorPoint(900, 300, 900, 300); // zero-delta drag: selects v1 without moving it

  const before = await readDesignState(page);
  const nodeId = before.rootOrder[before.rootOrder.length - 1];
  const v1Id = findVertexIdNear(before.nodes[nodeId].vertices, 900, 300);

  await page.keyboard.press('ArrowRight');

  const { nodes } = await readDesignState(page);
  const { vertices } = nodes[nodeId];

  expect(vertices?.[v1Id]).toEqual({ id: v1Id, x: 901, y: 300 }); // v1 nudged by exactly 1px
  expect(hasVertexNear(vertices, 1000, 300)).toBe(true); // v2 untouched
});

test('Shift+arrow nudges the selected vertex by the large 10px step, and Undo restores it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-nudge-vertex-large-undo');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300);
  await designPage.selectVectorEditMoveTool();
  await designPage.dragVectorPoint(900, 300, 900, 300); // select v1

  await page.keyboard.press('Shift+ArrowDown');

  const afterNudge = await readDesignState(page);
  const nudgedVertices = afterNudge.nodes[afterNudge.rootOrder[afterNudge.rootOrder.length - 1]].vertices;

  expect(hasVertexNear(nudgedVertices, 900, 310)).toBe(true);

  await page.keyboard.press('Control+z');

  const afterUndo = await readDesignState(page);
  const restoredVertices = afterUndo.nodes[afterUndo.rootOrder[afterUndo.rootOrder.length - 1]].vertices;

  expect(hasVertexNear(restoredVertices, 900, 300)).toBe(true);
});

test('pressing the Right arrow key nudges a selected tangent handle, leaving the vertex itself in place', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-nudge-handle');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — stages a tangent, its mirror lands at (1050,350)
  await designPage.click(1200, 300); // v3
  await designPage.selectVectorEditMoveTool();
  await designPage.click(1050, 300); // select v2 to reveal its handles

  const before = await readDesignState(page);
  const nodeIdBefore = before.rootOrder[before.rootOrder.length - 1];
  const segmentsBefore = before.nodes[nodeIdBefore].segments ?? {};
  // the handle rendered at (1050,350) is v2's tip at (1050,300) + tangent (0,50)
  const [handleSegmentId] = Object.entries(segmentsBefore).find(
    ([, segment]) => segment.tangentStart?.y === 50 || segment.tangentEnd?.y === 50,
  ) as [string, TVectorSegment];

  await designPage.dragVectorPoint(1050, 350, 1050, 350); // zero-delta drag: selects that handle without moving it
  await page.keyboard.press('ArrowRight');

  const after = await readDesignState(page);
  const nodeIdAfter = after.rootOrder[after.rootOrder.length - 1];
  const segmentAfter = (after.nodes[nodeIdAfter].segments ?? {})[handleSegmentId];
  const nudgedTangent = segmentAfter.tangentStart?.y === 50 ? segmentAfter.tangentStart : segmentAfter.tangentEnd;

  expect(nudgedTangent).toEqual({ x: 1, y: 50 }); // nudged 1px right, y untouched
  expect(hasVertexNear(after.nodes[nodeIdAfter].vertices, 1050, 300)).toBe(true); // v2 itself never moved
});

test('Alt+arrow-key nudging a selected vertex keeps a Vector Edit Mode distance measurement live, updating the gap as the vertex moves', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-nudge-alt-distance-guide');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A — v1 at (900,300), selected and nudged
  await designPage.selectTool('default');
  await drawClosedSquareAt(designPage, 1200, 300); // B — a vertex at (1200,300), the hover target
  await designPage.selectTool('default');

  // open both A and B for editing at once (multi-vector edit), matching resolveVectorDistanceGuides'
  // own requirement that anchor and target both live in a currently-open node
  await designPage.click(900, 300);
  await designPage.click(1200, 300, { shift: true });
  await page.keyboard.press('Enter');
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(900, 300, 900, 300); // select A's v1 — the anchor

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1200, 300); // hover B's vertex — the cursor stays here for the rest of the test
  const beforeNudge = await designPage.canvas.screenshot();

  await page.keyboard.press('ArrowRight'); // Alt is already physically down, so this nudge carries altKey:true
  const afterNudge = await designPage.canvas.screenshot();

  // the gap closed by 1px — the live-updated label makes this frame differ from the one above
  expect(afterNudge.equals(beforeNudge)).toBe(false);

  await page.keyboard.up('Alt');
  const afterAltReleased = await designPage.canvas.screenshot();

  // releasing Alt (still without moving the mouse) clears the measurement on the next resolved frame
  expect(afterAltReleased.equals(afterNudge)).toBe(false);
});

test('the multi-select box recomputes to match two nudged vertices instead of staying frozen at their pre-nudge position', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 120, width: 260, x: 850, y: 250 };

  const selectV1AndV2ViaLasso = async (): Promise<void> => {
    await designPage.selectVectorEditMoveTool();
    await page.keyboard.press('q');
    await designPage.dragVectorLasso([
      { x: 850, y: 250 },
      { x: 1050, y: 250 },
      { x: 1050, y: 320 },
      { x: 850, y: 320 },
    ]);
  };

  // scenario A — draw the square at its original position, select v1+v2 (both at y=300), nudge them
  // 10px right with Shift+ArrowRight, and capture the multi-select box afterwards
  await designPage.goto('e2e-test-vector-edit-nudge-multi-select-box');
  await expect(designPage.canvas).toBeVisible();
  await drawClosedSquareAt(designPage, 900, 300);
  await selectV1AndV2ViaLasso();
  await page.keyboard.press('Shift+ArrowRight');
  const nudged = await page.screenshot({ clip: region });

  // scenario B — draw the square with v1/v2 already 10px to the right of where scenario A started
  // (the exact end state the nudge above should produce), select them the same way, no nudge — the
  // ground truth the box should match if it recomputed against the real, post-nudge positions instead
  // of staying cached at the pre-nudge ones
  await designPage.goto('e2e-test-vector-edit-nudge-multi-select-box-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawVectorPath([
    { x: 910, y: 300 },
    { x: 1010, y: 300 },
    { x: 1000, y: 400 },
    { x: 900, y: 400 },
    { x: 910, y: 300 },
  ]);
  await selectV1AndV2ViaLasso();
  const reference = await page.screenshot({ clip: region });

  expect(nudged.equals(reference)).toBe(true);
});
