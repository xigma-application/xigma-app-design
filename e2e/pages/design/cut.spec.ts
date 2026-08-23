import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test.describe.configure({ mode: 'serial' });

// v1(900,300) -> v2(1000,300) -> v3(1000,400) -> v4(900,400) -> back onto v1, closing the loop. Same
// shape/coordinates as vector-edit.spec.ts's own drawClosedSquare, kept local here so this file has no
// cross-file dependency.
const drawClosedSquare = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 300 },
    { x: 1000, y: 400 },
    { x: 900, y: 400 },
    { x: 900, y: 300 },
  ]);
};

const paintWholeSquare = async (page: import('@playwright/test').Page, designPage: DesignPage): Promise<void> => {
  await page.keyboard.press('Shift+B');
  await designPage.click(950, 350);
};

test("pressing 'x' switches the active tool to Cut while a node is open for editing", async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-shortcut-in-edit-mode');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('x');

  const activeTool = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.activeTool;
  });

  expect(activeTool).toBe('cut');
});

test('with no node open for editing, dragging with Cut active is a no-op — the tool itself switches, but armVectorCutOnPointerDown gates on vectorEditingNodeIds', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-shortcut-outside-edit-mode');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectTool('default'); // exits Vector Edit Mode entirely — no node open

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design;
  });

  expect(before.vectorEditingNodeIds).toEqual([]);

  await page.keyboard.press('x');
  await designPage.dragVectorPoint(850, 350, 1050, 350); // would split the square if Cut were actually armed

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design;
  });

  expect(after.activeTool).toBe('cut'); // the shortcut still switches the tool globally
  expect(after.rootOrder).toEqual(before.rootOrder); // but nothing about the square changed
  expect(after.nodes[after.rootOrder[0]]).toEqual(before.nodes[before.rootOrder[0]]);
});

test('Split: a plain click (no drag) on a segment severs it at that point without creating a new node', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-split-plain-click');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('x');

  const rootOrderBefore = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });

  await designPage.click(950, 300); // dead center of the top edge — click, not drag

  const result = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return { rootOrder: state.design.rootOrder, vertexCount: Object.keys(state.design.nodes[state.design.rootOrder[0]].vertices).length };
  });

  // still one node, but two brand-new vertices sit at the same point (800,300) with no shared segment
  expect(result.rootOrder).toEqual(rootOrderBefore);
  expect(result.vertexCount).toBe(6);
});

test('Split: clicking on a branch vertex (3+ segments) detaches only the clicked segment, leaving the other two intact', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-split-branch-vertex');
  await expect(designPage.canvas).toBeVisible();

  // a "Y": stem a(900,400)->b(900,300), then two more strokes fanning out from b — b ends up degree 3
  await designPage.drawVectorPath([
    { x: 900, y: 400 },
    { x: 900, y: 300 },
  ]);
  await designPage.selectVectorEditMoveTool();
  await designPage.doubleClick(900, 300); // re-enter Pen on b to keep extending from it
  await page.keyboard.press('p');
  await designPage.click(900, 300);
  await designPage.click(1000, 250);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('p');
  await designPage.click(900, 300);
  await designPage.click(800, 250);
  await designPage.selectVectorEditMoveTool();

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const nodeId = state.design.rootOrder[state.design.rootOrder.length - 1];

    return { segmentCount: Object.keys(state.design.nodes[nodeId].segments).length };
  });

  expect(before.segmentCount).toBe(3); // a-b, b-(1000,250), b-(800,250)

  await page.keyboard.press('x');
  await designPage.click(900, 300); // exactly on b

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const nodeId = state.design.rootOrder[state.design.rootOrder.length - 1];
    const node = state.design.nodes[nodeId];

    return { segmentCount: Object.keys(node.segments).length, vertexCount: Object.keys(node.vertices).length };
  });

  // one of the 3 segments at b got its own new endpoint; the other 2 are still attached to the original b
  expect(after.segmentCount).toBe(3);
  expect(after.vertexCount).toBe(5);
});

test('Divide: a real drag that starts and ends outside the shape on both sides splits a filled square into two independently-filled halves', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-divide-line-past-both-sides');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // (900,300)-(1000,300)-(1000,400)-(900,400)
  await designPage.selectVectorEditMoveTool();
  await paintWholeSquare(page, designPage);

  const rootOrderBefore = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });

  await page.keyboard.press('x');
  // starts 50px left of the square, ends 50px right of it — neither endpoint touches the shape
  await designPage.dragVectorPoint(850, 350, 1050, 350);

  const result = await page.evaluate(async (before) => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const newIds = state.design.rootOrder.filter((id) => !before.includes(id));

    return {
      pieces: [state.design.rootOrder[0], ...newIds].map((id) => ({
        filledFaceKeys: state.design.nodes[id].filledFaceKeys.length,
        vertexCount: Object.keys(state.design.nodes[id].vertices).length,
      })),
    };
  }, [rootOrderBefore].flat());

  expect(result.pieces).toHaveLength(2);
  result.pieces.forEach((piece) => {
    expect(piece.vertexCount).toBe(4);
    expect(piece.filledFaceKeys).toBeGreaterThan(0);
  });
});

test('Divide: a line that misses the shape entirely leaves it completely untouched', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-divide-line-misses-shape');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await paintWholeSquare(page, designPage);

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return { node: state.design.nodes[state.design.rootOrder[0]], rootOrder: state.design.rootOrder };
  });

  await page.keyboard.press('x');
  await designPage.dragVectorPoint(1200, 350, 1400, 350); // well clear of the square

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return { node: state.design.nodes[state.design.rootOrder[0]], rootOrder: state.design.rootOrder };
  });

  expect(after.rootOrder).toEqual(before.rootOrder);
  expect(after.node).toEqual(before.node);
});

test('Divide: a line crossing only one edge of a closed triangle leaves it as one connected node — the other two edges still bridge the severed point', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-divide-single-edge-crossing');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 400 },
    { x: 1000, y: 400 },
    { x: 950, y: 300 },
    { x: 900, y: 400 },
  ]);
  await designPage.selectVectorEditMoveTool();

  const rootOrderBefore = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });

  await page.keyboard.press('x');
  // a short vertical line crossing only the base edge (y=400), well short of the other two edges
  await designPage.dragVectorPoint(950, 380, 950, 420);

  const rootOrderAfter = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });

  // no new node — the triangle's other two edges keep the severed base connected as one piece
  expect(rootOrderAfter).toEqual(rootOrderBefore);
});

test('Divide: cutting an unfilled square leaves both halves unfilled', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-divide-unfilled-square');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // left unpainted
  await designPage.selectVectorEditMoveTool();

  const rootOrderBefore = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });

  await page.keyboard.press('x');
  await designPage.dragVectorPoint(850, 350, 1050, 350);

  const result = await page.evaluate(async (before) => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const newIds = state.design.rootOrder.filter((id) => !before.includes(id));

    return [state.design.rootOrder[0], ...newIds].map((id) => state.design.nodes[id].filledFaceKeys);
  }, [rootOrderBefore].flat());

  expect(result).toHaveLength(2);
  result.forEach((filledFaceKeys) => expect(filledFaceKeys).toEqual([]));
});

test('Regression: cutting a shape with 3 adjacent painted faces keeps every fill, including the middle one (addCutClosingSegment used to pair open ends globally and silently drop it)', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-divide-tent-middle-fill');
  await expect(designPage.canvas).toBeVisible();

  // injected directly (like vector-edit.spec.ts's own "egg" repro) — a "tent": a left and a right
  // triangle, plus the middle triangle their slanted edges form together, each painted separately
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNode, setVectorEditingNodeIds } = await import('/src/store/design/slice.ts');
    const { deriveVectorFaces } = await import('/src/utils/canvas/vectorNetwork/deriveVectorFaces.ts');
    const { getVectorFillLoopKey } = await import('/src/utils/canvas/vectorNetwork/getVectorFillLoopKey.ts');

    const segments = {
      baseLeft: { endId: 'bm', id: 'baseLeft', startId: 'bl', tangentEnd: null, tangentStart: null },
      baseRight: { endId: 'br', id: 'baseRight', startId: 'bm', tangentEnd: null, tangentStart: null },
      leftDiag: { endId: 'bm', id: 'leftDiag', startId: 'tl', tangentEnd: null, tangentStart: null },
      leftEdge: { endId: 'tl', id: 'leftEdge', startId: 'bl', tangentEnd: null, tangentStart: null },
      rightDiag: { endId: 'bm', id: 'rightDiag', startId: 'tr', tangentEnd: null, tangentStart: null },
      rightEdge: { endId: 'br', id: 'rightEdge', startId: 'tr', tangentEnd: null, tangentStart: null },
      topEdge: { endId: 'tr', id: 'topEdge', startId: 'tl', tangentEnd: null, tangentStart: null },
    };
    const vertices = {
      bl: { id: 'bl', x: 850, y: 400 },
      bm: { id: 'bm', x: 950, y: 400 },
      br: { id: 'br', x: 1050, y: 400 },
      tl: { id: 'tl', x: 900, y: 300 },
      tr: { id: 'tr', x: 1000, y: 300 },
    };

    const faces = deriveVectorFaces({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      id: 'probe',
      name: '',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: 'vector',
      vertexHandleModes: {},
      vertices,
    } as never);

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

    store.dispatch(setVectorEditingNodeIds([state.design.rootOrder[state.design.rootOrder.length - 1]]));
  });

  await page.keyboard.press('x');
  // horizontal line at y=350 (between the two peaks and the baseline), well clear of the shape on both sides
  await designPage.dragVectorPoint(800, 350, 1100, 350);

  const filledFaceCounts = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return state.design.vectorEditingNodeIds.map((id) => state.design.nodes[id].filledFaceKeys.length);
  });

  expect(filledFaceCounts).toHaveLength(2);
  filledFaceCounts.forEach((count) => expect(count).toBe(3)); // every piece keeps all 3 sub-fills
});

test('Regression: cutting an already-cut piece a second time keeps its fill (a fragment segment id like "s2#1" used to fail to match its original face)', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-divide-twice-in-a-row');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // (900,300)-(1000,300)-(1000,400)-(900,400), 100x100
  await designPage.selectVectorEditMoveTool();
  await paintWholeSquare(page, designPage);

  await page.keyboard.press('x');
  await designPage.dragVectorPoint(850, 330, 1050, 330); // first cut, near the top — leaves a tall bottom piece

  const afterFirstCut = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return state.design.vectorEditingNodeIds.map((id) => ({
      id,
      maxY: Math.max(...Object.values(state.design.nodes[id].vertices).map((v: { y: number }) => v.y)),
    }));
  });

  const bottomPieceId = afterFirstCut.find((piece) => piece.maxY > 330)!.id;

  await designPage.dragVectorPoint(850, 365, 1050, 365); // second cut, through the bottom piece's own middle

  const finalPieces = await page.evaluate(async (touchedId) => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return state.design.vectorEditingNodeIds
      .filter((id) => id !== touchedId || state.design.nodes[id])
      .map((id) => state.design.nodes[id].filledFaceKeys.length);
  }, [bottomPieceId].flat());

  // 3 pieces total (untouched top third, plus the 2 the second cut produced) — every single one filled
  expect(finalPieces).toHaveLength(3);
  finalPieces.forEach((count) => expect(count).toBeGreaterThan(0));
});

test('Regression: a face painted across a Pen-drawn line crossing an existing shape keeps its fill after a later Cut (the crossing used to only exist virtually, never persisted as a real vertex)', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-divide-paint-across-crossing');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // (900,300)-(1000,300)-(1000,400)-(900,400)
  await designPage.selectVectorEditMoveTool();

  // a separate line, drawn with the Pen tool, crossing the square's left and right edges — not touching
  // either endpoint of the square itself
  await page.keyboard.press('p');
  await designPage.click(850, 350);
  await designPage.click(1050, 350);
  await page.keyboard.press('Escape');

  await page.keyboard.press('Shift+B');
  await designPage.click(950, 325); // paint the top half (above the crossing line)
  await designPage.click(950, 375); // paint the bottom half

  await page.keyboard.press('x');
  // vertical cut through the middle, crossing both halves and the horizontal line at once
  await designPage.dragVectorPoint(950, 250, 950, 450);

  const fillCountsPerPiece = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return state.design.vectorEditingNodeIds.map((id) => state.design.nodes[id].filledFaceKeys.length);
  });

  // the vertical cut only ever splits along ONE line, so it produces 2 nodes (left half, right half) —
  // not 4. What matters for this regression is that each half keeps BOTH of its own sub-fills (the
  // ones straddling the earlier horizontal crossing), 4 real filled regions in total across the 2 nodes
  expect(fillCountsPerPiece).toHaveLength(2);
  expect(fillCountsPerPiece.reduce((sum, count) => sum + count, 0)).toBe(4);
  fillCountsPerPiece.forEach((count) => expect(count).toBe(2));
});

test('a single Undo after a Divide cut restores the original filled square in one step', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-divide-undo');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await paintWholeSquare(page, designPage);

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return { node: state.design.nodes[state.design.rootOrder[0]], rootOrder: state.design.rootOrder };
  });

  await page.keyboard.press('x');
  await designPage.dragVectorPoint(850, 350, 1050, 350);

  const afterCut = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.rootOrder;
  });

  expect(afterCut).toHaveLength(2); // sanity check: the cut actually produced 2 pieces

  await page.keyboard.press('Control+z');

  const afterUndo = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return { node: state.design.nodes[state.design.rootOrder[0]], rootOrder: state.design.rootOrder };
  });

  expect(afterUndo.rootOrder).toEqual(before.rootOrder);
  expect(afterUndo.node).toEqual(before.node);
});
