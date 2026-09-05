import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// "Use as mask" — Ctrl+Alt+M on non-macOS, matching useKeyboardShortcuts/shortcuts.ts's
// useAsMask: { primaryKeys: [CONTROL_PRIMARY_KEY, MASK_MODIFIER_KEY], secondaryKey: 'm' } — same
// two-modifier shape (and literal key order) as outline-as-stroke.spec.ts's own OUTLINE_STROKE_SHORTCUT
const USE_AS_MASK_SHORTCUT = 'Alt+Control+M';

const readDesignState = (
  page: Page,
): Promise<{
  nodes: Record<string, { childIds?: string[]; isMask?: boolean; name: string; type: string }>;
  rootOrder: string[];
  selectedIds: string[];
}> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

// samples a single pixel's RGB out of a tiny clipped screenshot — same PNG-decode technique
// vector-edit.spec.ts uses for pixel-level assertions, just reading one pixel instead of a region
const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

const isStillVectorEditing = (page: Page): Promise<boolean> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.vectorEditingNodeIds.length > 0;
  });

// selectTool('default') is a no-op while vectorEditingNodeIds is non-empty — 'default' isn't in
// isDispatchToolBlocked.ts's VECTOR_EDIT_ALLOWED_TOOLS, so dispatchTool silently blocks it. Escape
// is the real way out (handleLeave.ts): one press per state it has to unwind through (clear the
// active pen vertex on an open path, switch to Move, then finally drop vectorEditingNodeIds) — so
// press it one at a time and stop the moment edit mode is actually gone, since one press too many
// falls through to the "already exited" case, which also clears the selection
const exitVectorEditMode = async (page: Page): Promise<void> => {
  for (let attempt = 0; attempt < 4 && (await isStillVectorEditing(page)); attempt += 1) {
    await page.keyboard.press('Escape');
  }
};

const isRed = ([r, g, b]: [number, number, number]): boolean => r > 180 && g < 80 && b < 80;

test('"Use as mask" wraps two selected rectangles in a "Mask group", marking the topmost (drawn second) as the mask, and clips the sibling to its shape', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-mask-basic-clip');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 900, 500); // A — the masked content, larger
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [idA] = pages[activePageId].rootOrder;

    store.dispatch(updateNode({ changes: { fill: '#FF0000' }, id: idA }));
  });

  await designPage.drawRectangle(750, 350, 850, 450); // B — drawn second (on top), becomes the mask
  await designPage.click(720, 320, { shift: true }); // add A back to the selection alongside B

  await page.keyboard.press(USE_AS_MASK_SHORTCUT);

  const after = await readDesignState(page);
  // "Use as mask" selects the mask shape itself afterward (handleUseNodesAsMask.spec.ts's own
  // documented behaviour), not the wrapping group — so the group is found via rootOrder instead,
  // since grouping always collapses the selected members down to that one entry there
  const [groupId] = after.rootOrder;
  const group = after.nodes[groupId];

  expect(group.name).toBe('Mask group');
  expect(group.childIds).toHaveLength(2);

  const maskChildId = group.childIds!.find((id) => after.nodes[id].isMask);
  const maskedChildId = group.childIds!.find((id) => !after.nodes[id].isMask);

  expect(maskChildId).toBeDefined();
  expect(maskedChildId).toBeDefined();
  // the mask is the last child in childIds (bottom row in the Layers panel) — B, drawn second
  expect(group.childIds!.indexOf(maskChildId!)).toBe(group.childIds!.length - 1);

  await designPage.click(1500, 700); // deselect
  await designPage.pointerMove(1500, 700); // neutral rest, no hover outline

  // inside both A and B's overlap (B's own 750-850,350-450 box) — revealed, shows A's red fill
  expect(isRed(await readPixelColor(page, 800, 400))).toBe(true);
  // inside A but outside B — masked away, must not show A's red fill
  expect(isRed(await readPixelColor(page, 880, 480))).toBe(false);
});

test('filling a mask vector reveals its underlying content everywhere the fill now covers, not just along the stroke — regression for the fill silently zeroing the mask target’s whole alpha channel', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-mask-vector-fill-regression');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 900, 500); // content, masked by the vector below
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [idA] = pages[activePageId].rootOrder;

    store.dispatch(updateNode({ changes: { fill: '#FF0000' }, id: idA }));
  });

  // a right triangle entirely inside the rectangle's bounds: (750,350) -> (850,350) -> (750,450),
  // left OPEN (no closing click back onto the first vertex) — mirroring both the reported repro
  // (an open, unfilled path) and vector-variable-width.spec.ts's own drawOpenTriangle convention.
  // Closed and filled further down, once the mask relationship is established
  await designPage.drawVectorPath([
    { x: 750, y: 350 },
    { x: 850, y: 350 },
    { x: 750, y: 450 },
  ]);
  await exitVectorEditMode(page);

  // exiting Vector Edit Mode on a freshly-drawn node leaves selectedIds as whatever it already was
  // (here, both the rectangle and the triangle — unlike a second drawRectangle, which replaces the
  // selection outright), so a shift-click on the rectangle here would actually toggle it OUT rather
  // than add it in. Setting the selection directly sidesteps that quirk — the actual behaviour under
  // test is the mask shortcut itself, triggered for real right below
  const { rectangleId, vectorId } = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    return { rectangleId: rootOrder[0], vectorId: rootOrder[1] };
  });

  await page.evaluate(
    async ([rectangleId, vectorId]) => {
      const { store } = await import('/src/store/index.ts');
      const { setSelection } = await import('/src/store/design/slice.ts');

      store.dispatch(setSelection([rectangleId, vectorId]));
    },
    [rectangleId, vectorId],
  );

  // guard against the dispatch above racing the mask shortcut's own read of selectedIds
  await page.waitForFunction(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds.length === 2;
  });

  await page.keyboard.press(USE_AS_MASK_SHORTCUT);

  const grouped = await readDesignState(page);
  // "Use as mask" selects the mask shape itself afterward, not the wrapping group — so the group is
  // found via rootOrder instead, since grouping always collapses the selected members down to that
  // one entry there
  const [groupId] = grouped.rootOrder;
  const group = grouped.nodes[groupId];
  const maskId = group.childIds!.find((id) => grouped.nodes[id].isMask)!;

  expect(group.childIds).toHaveLength(2); // both the rectangle and the vector actually got grouped
  expect(grouped.nodes[maskId].type).toBe('vector');

  await designPage.click(1500, 700); // deselect
  await designPage.pointerMove(1500, 700);

  // well inside the triangle's interior, clear of its 1px stroke — unfilled, so still masked away
  expect(isRed(await readPixelColor(page, 780, 390))).toBe(false);
  // inside the rectangle but outside the triangle entirely — masked away either way, a control point
  expect(isRed(await readPixelColor(page, 880, 480))).toBe(false);

  // Close the loop (connecting the last vertex back to the first, exactly what clicking back onto
  // the start vertex with the Pen tool would produce) and fill the now-closed face — the same two
  // things that happen together when the Paint tool closes and fills an open node in one gesture
  // (armVectorPaintOnPointerDown's own getVectorFaceAtPointAcrossOpenNodes only resolves a face for
  // an already-closed loop, so closing has to happen first). Uses the app's own
  // getVectorFaceAtPoint/getVectorFillLoopKey to compute the real face key, instead of hand-rolling
  // its string format
  await page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { getVectorFaceAtPoint } = await import('/src/components/Design/Canvas/utils/getVectorFaceAtPoint.ts');
    const { getVectorFillLoopKey } = await import('/src/utils/canvas/vectorNetwork/getVectorFillLoopKey.ts');
    const { activePageId, pages } = store.getState().design;
    const node = pages[activePageId].nodes[id] as {
      segments: Record<string, unknown>;
      vertices: Record<string, { x: number; y: number }>;
    };
    const vertexEntries = Object.entries(node.vertices);
    const [firstVertexId] = vertexEntries.find(([, v]) => v.x === 750 && v.y === 350)!;
    const [lastVertexId] = vertexEntries.find(([, v]) => v.x === 750 && v.y === 450)!;
    const closingSegmentId = crypto.randomUUID();
    const segments = {
      ...node.segments,
      [closingSegmentId]: { endId: firstVertexId, id: closingSegmentId, startId: lastVertexId, tangentEnd: null, tangentStart: null },
    };
    const closedNode = { ...node, segments };
    const face = getVectorFaceAtPoint({ x: 780, y: 390 }, closedNode)!;
    const key = getVectorFillLoopKey(face.pieceKeys);

    store.dispatch(updateNode({ changes: { fillColorOverrideByKey: { [key]: '#0d99ff' }, filledFaceKeys: [key], segments }, id }));
  }, maskId);

  await designPage.click(1500, 700); // deselect
  await designPage.pointerMove(1500, 700);

  // the fill now reveals the rectangle's red everywhere inside the triangle, not just its stroke
  expect(isRed(await readPixelColor(page, 780, 390))).toBe(true);
  // still spatially selective — outside the triangle (but inside the rectangle) stays masked away
  expect(isRed(await readPixelColor(page, 880, 480))).toBe(false);
});

test('"Remove mask" restores full visibility while the group itself stays intact (not ungrouped)', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-mask-remove');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 900, 500);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [idA] = pages[activePageId].rootOrder;

    store.dispatch(updateNode({ changes: { fill: '#FF0000' }, id: idA }));
  });
  await designPage.drawRectangle(750, 350, 850, 450);
  await designPage.click(720, 320, { shift: true });
  await page.keyboard.press(USE_AS_MASK_SHORTCUT);

  const grouped = await readDesignState(page);
  // "Use as mask" selects the mask shape itself afterward, not the wrapping group — so the group is
  // found via rootOrder instead, since grouping always collapses the selected members down to that
  // one entry there
  const [groupId] = grouped.rootOrder;
  const group = grouped.nodes[groupId];
  const maskId = group.childIds!.find((id) => grouped.nodes[id].isMask)!;

  await page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { toggleNodeMask } = await import('/src/store/design/slice.ts');

    store.dispatch(toggleNodeMask(id));
  }, maskId);

  const after = await readDesignState(page);

  expect(after.nodes[maskId].isMask).toBe(false);
  expect(after.nodes[groupId]).toBeDefined(); // the group stays a group — "Remove mask" never ungroups
  expect(after.nodes[groupId].childIds).toEqual(group.childIds);

  await designPage.click(1500, 700);
  await designPage.pointerMove(1500, 700);

  // previously masked-away, now fully visible again
  expect(isRed(await readPixelColor(page, 880, 480))).toBe(true);
});

test('a mask elsewhere in the scene must not blank out content nested inside a section — the recursive render path has to descend into sections too', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-mask-section-nested-content');
  await expect(designPage.canvas).toBeVisible();

  // a section with a single red rectangle nested inside it (nested via the store so the rectangle
  // keeps its on-canvas position)
  await designPage.drawSection(600, 200, 1050, 620);
  await designPage.drawRectangle(700, 300, 820, 420);

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { moveNodes, updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [sectionId, rectId] = pages[activePageId].rootOrder;

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: sectionId }));
    store.dispatch(updateNode({ changes: { fill: '#FF0000' }, id: rectId }));
  });

  await designPage.click(1500, 700); // deselect
  await designPage.pointerMove(1500, 700);

  // baseline: the nested rectangle renders
  expect(isRed(await readPixelColor(page, 760, 360))).toBe(true);

  // build an unrelated "Mask group" well clear of the section — this flips the whole scene onto
  // the offscreen-compositing render path
  await designPage.drawRectangle(1150, 300, 1350, 500);
  await designPage.drawRectangle(1200, 340, 1300, 440);
  await designPage.click(1170, 320, { shift: true });
  await page.keyboard.press(USE_AS_MASK_SHORTCUT);

  await designPage.click(1500, 700); // deselect
  await designPage.pointerMove(1500, 700);

  // the section's nested rectangle must still be there — before the fix the recursive path never
  // descended into a section, so everything inside it vanished the moment a mask existed anywhere
  expect(isRed(await readPixelColor(page, 760, 360))).toBe(true);
});

test('Control+Z undoes "Use as mask" as a single step, restoring the exact pre-mask state', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-mask-undo');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 900, 500);
  await designPage.drawRectangle(750, 350, 850, 450);
  await designPage.click(720, 320, { shift: true });

  const before = await readDesignState(page);

  await page.keyboard.press(USE_AS_MASK_SHORTCUT);

  const grouped = await readDesignState(page);
  expect(grouped.selectedIds).toHaveLength(1);
  // "Use as mask" selects the mask shape itself afterward, not the wrapping group — so the group is
  // found via rootOrder instead, since grouping always collapses the selected members down to that
  // one entry there
  const [groupId] = grouped.rootOrder;

  await page.keyboard.press('Control+z');

  const after = await readDesignState(page);

  expect(after.nodes[groupId]).toBeUndefined(); // the "Mask group" node itself is gone
  expect(after.rootOrder).toEqual(before.rootOrder);
  expect(after.selectedIds).toEqual(before.selectedIds);
  expect(after.nodes).toEqual(before.nodes);
});
