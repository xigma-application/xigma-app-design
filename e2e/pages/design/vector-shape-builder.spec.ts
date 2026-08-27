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
      const { deriveVectorFaces } = await import('/src/utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces.ts');
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

// a plain, unfilled 150x200 rectangle as its own standalone vector node — for the cross-node
// crossing scenarios below, where two genuinely SEPARATE nodes overlap on screen (unlike
// injectSplitRectangle, which is one node with an internal chord). Segment/vertex ids are prefixed
// per call — addNode stores them verbatim (only the node's own top-level id is nanoid()-generated),
// so two calls sharing literal 's1'/'v1' ids would collide once unioned for crossing detection
const injectRectangleNode = (page: Page, prefix: string, offsetX: number, offsetY: number): Promise<string> =>
  page.evaluate(
    async ({ offsetX, offsetY, prefix }) => {
      const { store } = await import('/src/store/index.ts');
      const { addNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        addNode({
          fillColor: null,
          filledFaceKeys: [],
          name: 'Vector',
          parentId: null,
          rotation: 0,
          segments: {
            [`${prefix}s1`]: { endId: `${prefix}v2`, id: `${prefix}s1`, startId: `${prefix}v1`, tangentEnd: null, tangentStart: null },
            [`${prefix}s2`]: { endId: `${prefix}v3`, id: `${prefix}s2`, startId: `${prefix}v2`, tangentEnd: null, tangentStart: null },
            [`${prefix}s3`]: { endId: `${prefix}v4`, id: `${prefix}s3`, startId: `${prefix}v3`, tangentEnd: null, tangentStart: null },
            [`${prefix}s4`]: { endId: `${prefix}v1`, id: `${prefix}s4`, startId: `${prefix}v4`, tangentEnd: null, tangentStart: null },
          },
          strokeColor: '#000000',
          strokeWidth: 1,
          type: 'vector',
          vertexHandleModes: {},
          vertices: {
            [`${prefix}v1`]: { id: `${prefix}v1`, x: 900 + offsetX, y: 300 + offsetY },
            [`${prefix}v2`]: { id: `${prefix}v2`, x: 900 + offsetX + 150, y: 300 + offsetY },
            [`${prefix}v3`]: { id: `${prefix}v3`, x: 900 + offsetX + 150, y: 300 + offsetY + 200 },
            [`${prefix}v4`]: { id: `${prefix}v4`, x: 900 + offsetX, y: 300 + offsetY + 200 },
          },
        } as never),
      );

      const state = store.getState();

      return state.design.rootOrder[state.design.rootOrder.length - 1];
    },
    { offsetX, offsetY, prefix },
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
    const { deriveVectorFaces } = await import('/src/utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces.ts');
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

test('dragging across two genuinely overlapping, separate open nodes merges them into one — the survivor absorbs the other, which is deleted from rootOrder and vectorEditingNodeIds', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-cross-node-merge');
  await expect(designPage.canvas).toBeVisible();

  // same overlap proportions as the single-node crossing-rectangles regression above, but as two
  // genuinely separate nodes this time
  const idA = await injectRectangleNode(page, 'a', 0, 0); // (900,300)-(1050,500)
  const idB = await injectRectangleNode(page, 'b', 75, 100); // (975,400)-(1125,600)

  await enterVectorEditModeFor(page, [idA, idB]);
  await page.keyboard.press('m');

  // sweeps through the A-only region, the overlap, then the B-only region
  await designPage.dragVectorShapeBuilder([
    { x: 925, y: 325 },
    { x: 1000, y: 450 },
    { x: 1100, y: 575 },
  ]);

  const state = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const s = store.getState().design;

    return { rootOrder: s.rootOrder, vectorEditingNodeIds: s.vectorEditingNodeIds };
  });
  const survivor = await readNode(page, idA);

  expect(state.rootOrder).toEqual([idA]); // B got absorbed and deleted
  expect(state.vectorEditingNodeIds).toEqual([idA]); // pruned of the deleted id
  expect(survivor.filledFaceKeys).toHaveLength(1); // all 3 sub-regions merged into one
});

test('Alt+drag across two overlapping, separate open nodes subtracts only the crossing sub-region, still combining the pair into one node since the crossing had to be materialized either way', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-cross-node-subtract');
  await expect(designPage.canvas).toBeVisible();

  const idA = await injectRectangleNode(page, 'a', 0, 0); // (900,300)-(1050,500)
  const idB = await injectRectangleNode(page, 'b', 75, 100); // (975,400)-(1125,600)

  await enterVectorEditModeFor(page, [idA, idB]);
  await page.keyboard.press('m');

  // Alt+click dead center of the overlap only
  await designPage.click(1000, 450, { alt: true });

  const state = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });
  const survivor = await readNode(page, idA);

  expect(state).toEqual([idA]); // still combined into one node, B absorbed
  expect(survivor.filledFaceKeys).toEqual([]); // nothing was filled to begin with
  expect(survivor.segmentIds.length).toBeGreaterThan(0); // each rectangle's own outer edges survive
});

test('Alt+click on only ONE shape’s own exclusive corner — never touching the untouched, crossing neighbor at all — still protects the shared chord instead of treating that shape as fully isolated', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-builder-cross-node-subtract-exclusive-only');
  await expect(designPage.canvas).toBeVisible();

  const idA = await injectRectangleNode(page, 'a', 0, 0); // (900,300)-(1050,500)
  const idB = await injectRectangleNode(page, 'b', 75, 100); // (975,400)-(1125,600)

  await enterVectorEditModeFor(page, [idA, idB]);
  await page.keyboard.press('m');

  // Alt+click deep inside B's own exclusive corner — outside A's bounds (900-1050) entirely
  await designPage.click(1100, 550, { alt: true });

  const state = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });
  const survivor = await readNode(page, idA);

  // B still gets absorbed into A even though A itself was never touched by this click — the crossing
  // had to be materialized regardless, and B's own exclusive boundary is what actually gets deleted
  expect(state).toEqual([idA]);
  expect(survivor.segmentIds.length).toBeGreaterThan(4); // A's own 4 edges survive (some split) plus a surviving B chord piece
});
