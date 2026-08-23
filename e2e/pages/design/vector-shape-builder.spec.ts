import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

// a 100x100 rectangle split in half by a horizontal "divider" segment (e-f), forming a top and a
// bottom face that share exactly that one segment — mirrors mergeVectorFaces.spec.ts's own
// splitRectangleNode fixture, injected directly since re-entering an already-closed Pen path to
// draw an internal chord is flaky in a real browser; parameterized by an offset so a single test
// can place several independent instances side by side on one canvas.
const injectSplitRectangle = (page: Page, offsetX = 0, offsetY = 0, filled = false): Promise<string> =>
  page.evaluate(
    async ({ filled, offsetX, offsetY }) => {
      const { store } = await import('/src/store/index.ts');
      const { addNode } = await import('/src/store/design/slice.ts');
      const { deriveVectorFaces } = await import('/src/utils/canvas/vectorNetwork/deriveVectorFaces.ts');
      const { getVectorFillLoopKey } = await import('/src/utils/canvas/vectorNetwork/getVectorFillLoopKey.ts');

      const segments = {
        bottom: { endId: 'd', id: 'bottom', startId: 'c', tangentEnd: null, tangentStart: null },
        divider: { endId: 'f', id: 'divider', startId: 'e', tangentEnd: null, tangentStart: null },
        leftLower: { endId: 'e', id: 'leftLower', startId: 'd', tangentEnd: null, tangentStart: null },
        leftUpper: { endId: 'a', id: 'leftUpper', startId: 'e', tangentEnd: null, tangentStart: null },
        rightLower: { endId: 'c', id: 'rightLower', startId: 'f', tangentEnd: null, tangentStart: null },
        rightUpper: { endId: 'f', id: 'rightUpper', startId: 'b', tangentEnd: null, tangentStart: null },
        top: { endId: 'b', id: 'top', startId: 'a', tangentEnd: null, tangentStart: null },
      };
      const vertices = {
        a: { id: 'a', x: 900 + offsetX, y: 300 + offsetY },
        b: { id: 'b', x: 1000 + offsetX, y: 300 + offsetY },
        c: { id: 'c', x: 1000 + offsetX, y: 400 + offsetY },
        d: { id: 'd', x: 900 + offsetX, y: 400 + offsetY },
        e: { id: 'e', x: 900 + offsetX, y: 350 + offsetY },
        f: { id: 'f', x: 1000 + offsetX, y: 350 + offsetY },
      };
      const faces = filled ? deriveVectorFaces({ segments, vertices } as never) : [];

      store.dispatch(
        addNode({
          fillColor: '#ff0000',
          filledFaceKeys: faces.map((face: { pieceKeys: string[] }) => getVectorFillLoopKey(face.pieceKeys)),
          name: 'Vector',
          parentId: null,
          rotation: 0,
          segments,
          strokeColor: '#000000',
          strokeWidth: 1,
          type: 'vector',
          vertexHandleModes: {},
          vertices,
        } as never),
      );

      const state = store.getState();

      return state.design.rootOrder[state.design.rootOrder.length - 1];
    },
    { filled, offsetX, offsetY },
  );

const enterVectorEditModeFor = (page: Page, nodeIds: string[]): Promise<void> =>
  page.evaluate(async (ids) => {
    const { store } = await import('/src/store/index.ts');
    const { setVectorEditingNodeIds } = await import('/src/store/design/slice.ts');

    store.dispatch(setVectorEditingNodeIds(ids));
  }, nodeIds);

const readNode = (page: Page, nodeId: string): Promise<{ filledFaceKeys: string[]; segmentIds: string[] }> =>
  page.evaluate((id) => {
    return import('/src/store/index.ts').then(({ store }) => {
      const node = store.getState().design.nodes[id];

      return { filledFaceKeys: node.filledFaceKeys, segmentIds: Object.keys(node.segments) };
    });
  }, nodeId);

test('a freeform drag across a split rectangle’s two halves merges them into one face, deleting the shared divider segment', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-freeform-merge');
  await expect(designPage.canvas).toBeVisible();

  const nodeId = await injectSplitRectangle(page);

  await enterVectorEditModeFor(page, [nodeId]);
  await page.keyboard.press('m');

  // sweeps from the top half, down through the divider, into the bottom half
  await designPage.dragVectorShapeBuilder([
    { x: 950, y: 310 },
    { x: 950, y: 350 },
    { x: 950, y: 390 },
  ]);

  const result = await readNode(page, nodeId);

  expect(result.segmentIds).not.toContain('divider');
  expect(result.segmentIds.sort()).toEqual(['bottom', 'leftLower', 'leftUpper', 'rightLower', 'rightUpper', 'top'].sort());
  expect(result.filledFaceKeys).toHaveLength(1);
});

test('a plain click fills a single unfilled face, and Alt+click on that same isolated face deletes its whole boundary — nothing else to protect', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-click-fill-alt-subtract-isolated');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 300 },
    { x: 1000, y: 400 },
    { x: 900, y: 400 },
    { x: 900, y: 300 }, // close the loop
  ]);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('m');

  const nodeId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder[0];
  });

  // action — plain click, no drag
  await designPage.click(950, 350);

  const afterClick = await readNode(page, nodeId);

  expect(afterClick.filledFaceKeys).toHaveLength(1);
  expect(afterClick.segmentIds).toHaveLength(4);

  // action — Alt+click the very same face; it has no untouched neighbor, so every one of its
  // boundary segments is exclusive and gets deleted along with the fill
  await designPage.click(950, 350, { alt: true });

  const afterAltClick = await readNode(page, nodeId);

  expect(afterAltClick.filledFaceKeys).toEqual([]);
  expect(afterAltClick.segmentIds).toEqual([]);
});

test('Alt+click subtracts a face by deleting only its own exclusive boundary, leaving the segment shared with an untouched, still-filled neighbor intact', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-alt-subtract-preserves-shared-neighbor');
  await expect(designPage.canvas).toBeVisible();

  const nodeId = await injectSplitRectangle(page, 0, 0, /* filled */ true);

  await enterVectorEditModeFor(page, [nodeId]);
  await page.keyboard.press('m');

  const before = await readNode(page, nodeId);

  expect(before.filledFaceKeys).toHaveLength(2); // sanity check: both halves start filled

  // action — Alt+click only the top half
  await designPage.click(950, 325, { alt: true });

  const after = await readNode(page, nodeId);

  // the top half's own exclusive edges (top, leftUpper, rightUpper) are gone, but "divider" survives
  // since it also bounds the untouched bottom face
  expect(after.segmentIds.sort()).toEqual(['bottom', 'divider', 'leftLower', 'rightLower']);
  expect(after.filledFaceKeys).toHaveLength(1); // only the bottom half's fill remains
});

test('holding Shift while dragging still merges the two halves via a box hit-test, proving the real-browser modifier reaches the gesture', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-shift-box-merge');
  await expect(designPage.canvas).toBeVisible();

  const nodeId = await injectSplitRectangle(page);

  await enterVectorEditModeFor(page, [nodeId]);
  await page.keyboard.press('m');

  await designPage.shiftDragVectorPoint(910, 310, 990, 390); // corner-to-corner box spanning both halves

  const result = await readNode(page, nodeId);

  expect(result.segmentIds).not.toContain('divider');
  expect(result.filledFaceKeys).toHaveLength(1);
});

test('dragging across two overlapping (crossing) rectangles merges all 3 resulting regions into one face', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-crossing-rectangles');
  await expect(designPage.canvas).toBeVisible();

  // two 150x200 rectangles staggered so they overlap in a middle band, same proportions as
  // mergeVectorFaces.spec.ts's own crossingRectanglesNode regression fixture — drawn as two
  // fragments on the same Pen node (pen.spec.ts: closing a loop and clicking elsewhere starts a
  // new, disconnected fragment on the same node rather than a stray connecting segment)
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
    { x: 1050, y: 500 },
    { x: 900, y: 500 },
    { x: 900, y: 300 },
  ]);
  await designPage.drawVectorPath([
    { x: 975, y: 400 },
    { x: 1125, y: 400 },
    { x: 1125, y: 600 },
    { x: 975, y: 600 },
    { x: 975, y: 400 },
  ]);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('m');

  const nodeId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder[0];
  });

  // sweeps through the rectangle-1-only region, the overlap, then the rectangle-2-only region
  await designPage.dragVectorShapeBuilder([
    { x: 925, y: 325 },
    { x: 1000, y: 450 },
    { x: 1100, y: 575 },
  ]);

  const faceCount = await page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { deriveVectorFaces } = await import('/src/utils/canvas/vectorNetwork/deriveVectorFaces.ts');
    const node = store.getState().design.nodes[id];

    return deriveVectorFaces({ ...node, filledFaceKeys: [] }).length;
  }, nodeId);
  const result = await readNode(page, nodeId);

  expect(faceCount).toBe(1);
  expect(result.filledFaceKeys).toHaveLength(1);
});

test('a single drag spanning two disconnected split rectangles merges each one’s own halves independently, without joining the two shapes together', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-disconnected-independent-merge');
  await expect(designPage.canvas).toBeVisible();

  const idA = await injectSplitRectangle(page, 0, 0); // x:900-1000, y:300-400
  const idB = await injectSplitRectangle(page, 400, 0); // x:1300-1400, y:300-400 — far apart, unrelated node

  await enterVectorEditModeFor(page, [idA, idB]);
  await page.keyboard.press('m');

  const rootOrderBefore = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });

  // one continuous freeform sweep: top-left to bottom-right of A, then the same for B
  await designPage.dragVectorShapeBuilder([
    { x: 910, y: 310 },
    { x: 990, y: 390 },
    { x: 1310, y: 310 },
    { x: 1390, y: 390 },
  ]);

  const rootOrderAfter = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });
  const resultA = await readNode(page, idA);
  const resultB = await readNode(page, idB);

  expect(rootOrderAfter).toEqual(rootOrderBefore); // still 2 separate nodes, never joined into one
  expect(resultA.segmentIds).not.toContain('divider');
  expect(resultA.filledFaceKeys).toHaveLength(1);
  expect(resultB.segmentIds).not.toContain('divider');
  expect(resultB.filledFaceKeys).toHaveLength(1);
});
