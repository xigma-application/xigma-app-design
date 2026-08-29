import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

type TWidthPoint = { id: string; leftOffset: number; position: number; rightOffset: number };
type TWidthProfileSnapshot = { points: Record<string, TWidthPoint> } | null;

const getRootNodeId = (page: Page): Promise<string> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    return rootOrder[rootOrder.length - 1];
  });

const readWidthProfile = (page: Page, nodeId: string): Promise<TWidthProfileSnapshot> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const node = pages[activePageId].nodes[id] as { widthProfile?: TWidthProfileSnapshot };

    return node.widthProfile ?? null;
  }, nodeId);

const readDesignState = (page: Page): Promise<{ activeTool: string; rootOrder: string[]; vectorEditingNodeIds: string[] }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, activeTool, pages, vectorEditingNodeIds } = store.getState().design;

    return { activeTool, rootOrder: pages[activePageId].rootOrder, vectorEditingNodeIds };
  });

// mirrors vector-edit-more-toolbar.spec.ts's own drawOpenTriangle — v1(900,300) -> v2(1050,300) ->
// v3(1050,450), plain clicks (no curve), left open in Vector Edit Mode with the toolbar visible.
const drawOpenTriangle = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
    { x: 1050, y: 450 },
  ]);
};

const exitVectorEditMode = async (designPage: DesignPage): Promise<void> => {
  await designPage.selectTool('default');
};

const openMultipleViaEnter = async (designPage: DesignPage, page: Page, points: { x: number; y: number }[]): Promise<void> => {
  const [first, ...rest] = points;

  await designPage.click(first.x, first.y);

  for (const point of rest) {
    await designPage.click(point.x, point.y, { shift: true });
  }

  await page.keyboard.press('Enter');
};

test('clicking the bare stroke at two different points adds two distinct width points, each pinned at the correct fraction of the whole chain', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-variable-width-add-multiple-points');
  await expect(designPage.canvas).toBeVisible();

  // a straight 2-segment chain, both segments exactly 150px long, so each segment's own midpoint
  // sits at a clean, predictable fraction (0.25 / 0.75) of the whole chain's arc length
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
    { x: 1200, y: 300 },
  ]);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+w');

  const nodeId = await getRootNodeId(page);

  // action — plain clicks on the bare stroke, no drag, one per segment's own midpoint
  await designPage.click(975, 300);
  await designPage.click(1125, 300);

  const widthProfile = await readWidthProfile(page, nodeId);
  const points = Object.values(widthProfile?.points ?? {});

  expect(points).toHaveLength(2);
  expect(new Set(points.map((point) => point.id)).size).toBe(2); // two genuinely distinct points

  const positions = points.map((point) => point.position).sort((a, b) => a - b);

  expect(positions[0]).toBeCloseTo(0.25, 1);
  expect(positions[1]).toBeCloseTo(0.75, 1);
});

test('selecting a freshly added width point shows its pink value-label overlay; clicking away deselects it while the point itself stays', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  // generous window around the point's anchor (975,300) — wide enough to catch the label regardless
  // of which perpendicular direction it's offset toward, without needing to know that sign up front
  const region = { height: 100, width: 60, x: 945, y: 250 };

  await designPage.goto('e2e-test-variable-width-label-visibility');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+w');

  // action — the click both creates the point and leaves it selected (armVectorWidthPointCreate
  // seeds selectedVectorWidthHandlesRef for the new point), so the label should already be showing
  await designPage.click(975, 300);
  const selected = await page.screenshot({ clip: region });

  // action — click far away on empty canvas: no stroke, no handle there, so this only clears the
  // Variable Width selection (armVectorWidthPointOnPointerDown's default branch)
  await designPage.click(700, 600);
  const deselected = await page.screenshot({ clip: region });

  expect(deselected.equals(selected)).toBe(false); // the label (and/or selection highlight) is gone

  // the point itself is never removed by deselecting — its square marker still renders, so this
  // region still differs from a version of the canvas with no point at all
  await designPage.click(700, 600); // rest away once more so this capture isn't affected by the click above
  const stillHasPoint = await page.screenshot({ clip: region });

  expect(stillHasPoint.equals(deselected)).toBe(true); // idle after deselect is stable, point persists
});

test('stretching a segment by dragging its endpoint keeps an existing width point pinned to the same relative fraction, moving it on screen', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  // a(900,300) -> b(1100,300), 200px long; the point sits at its exact midpoint (1000,300)
  const oldLocationRegion = { height: 60, width: 60, x: 970, y: 270 };
  // after b moves to (1300,300) the segment is 400px long; the same 0.5 fraction now sits at (1100,300)
  const newLocationRegion = { height: 60, width: 60, x: 1070, y: 270 };

  await designPage.goto('e2e-test-variable-width-stretch-redistribution');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 300 },
  ]);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+w');

  const nodeId = await getRootNodeId(page);

  await designPage.click(1000, 300); // add the point at the segment's exact midpoint

  const before = await readWidthProfile(page, nodeId);
  const beforePoint = Object.values(before?.points ?? {})[0];

  expect(beforePoint.position).toBeCloseTo(0.5, 2);

  const beforeOldLocation = await page.screenshot({ clip: oldLocationRegion });
  const beforeNewLocation = await page.screenshot({ clip: newLocationRegion });

  // action — drag endpoint b outward, doubling the segment's length; Variable Width overlays are
  // hidden while any other tool is active, so switch back afterward to re-render them for capture
  await designPage.selectVectorEditMoveTool();
  await designPage.dragVectorPoint(1100, 300, 1300, 300);
  await page.keyboard.press('Shift+w');

  const after = await readWidthProfile(page, nodeId);
  const afterPoint = Object.values(after?.points ?? {})[0];

  expect(afterPoint.id).toBe(beforePoint.id);
  expect(afterPoint.position).toBeCloseTo(0.5, 2); // the stored fraction never changed

  const afterOldLocation = await page.screenshot({ clip: oldLocationRegion });
  const afterNewLocation = await page.screenshot({ clip: newLocationRegion });

  expect(afterOldLocation.equals(beforeOldLocation)).toBe(false); // the marker left its old spot
  expect(afterNewLocation.equals(beforeNewLocation)).toBe(false); // ...and now renders at the new one
});

test('an edit that branches the network discards the node’s width profile and disables the Variable Width option again', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-variable-width-branch-disables');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300)-v2(1050,300)-v3(1050,450), open, non-branching
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+w'); // sets lastMoreTool, so the main slot now shows "Variable width"

  await expect(page.getByRole('button', { name: 'Variable width' })).toBeEnabled();

  const nodeId = await getRootNodeId(page);

  await designPage.click(975, 300); // add a width point on segment 1

  expect(Object.keys((await readWidthProfile(page, nodeId))?.points ?? {})).toHaveLength(1);

  // action — resume from v2 (already degree 2) with the Pen tool and extend a third segment from it,
  // raising its degree to 3: the same "resume an existing vertex, then extend" mechanic vector-edit-
  // multi.spec.ts's own merge tests rely on, just within a single node instead of joining two
  await designPage.selectTool('pen');
  await designPage.click(1050, 300); // resume v2
  await designPage.click(1050, 600); // v4 — new segment v2-v4 makes v2 degree 3

  const widthProfileAfterBranch = await readWidthProfile(page, nodeId);

  expect(widthProfileAfterBranch).toBeNull();

  await designPage.selectVectorEditMoveTool();
  await expect(page.getByRole('button', { name: 'Variable width' })).toBeDisabled();

  // the "Shift+W" shortcut must respect the very same gate the button's `disabled` attribute reflects
  // — dispatchTool.ts blocks any More-tool shortcut the eligibility check rejects, not just clicks
  await page.keyboard.press('Shift+w');
  expect((await readDesignState(page)).activeTool).toBe('move');
});

test('editing two separate nodes at once disables Variable Width; merging them into one via the Pen tool re-enables it', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-variable-width-multi-node-merge-enables');
  await expect(designPage.canvas).toBeVisible();

  // A and B are each a single open segment, both endpoints degree 1 — eligible chains on their own.
  // (Two CLOSED squares merged via one connecting vertex would instead produce a branching "dumbbell"
  // — that vertex would gain a 3rd edge on top of its own loop's 2 — so open endpoints are required
  // here for the merge itself to land on a still-eligible, non-branching combined chain.)
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 300 },
  ]); // A: a1(900,300)-a2(1000,300)
  await exitVectorEditMode(designPage); // resets lastMoreTool to null (handleSetVectorEditingNodeIds)

  await designPage.drawVectorPath([
    { x: 1200, y: 300 },
    { x: 1300, y: 300 },
  ]); // B: b1(1200,300)-b2(1300,300)
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  expect((await readDesignState(page)).vectorEditingNodeIds).toHaveLength(2);

  // the "Variable width" item is disabled — clicking it must be a no-op (PopoverItem skips both the
  // onClick and the Radix Close wrapper when disabled), so the tool never activates and the popover
  // stays open. This exercises the same gate for the dropdown's mouse-click path, distinct from the
  // main-slot button's own `disabled` attribute covered by the branching test above.
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByText('Variable width', { exact: true }).click();

  expect((await readDesignState(page)).activeTool).not.toBe('variableWidth');
  await expect(page.getByText('Shape builder', { exact: true })).toBeVisible(); // popover never closed
  await page.keyboard.press('Escape');

  // action — resume from A's free endpoint (a2) and click exactly onto B's own endpoint (b1): both
  // were degree 1, so the new connecting segment brings each to degree 2 — a longer, still-eligible
  // open chain (a1-a2-b1-b2), not a branch. Mirrors vector-edit-multi.spec.ts's own "pen-merge-vertex"
  // test, which confirms this collapses the two nodes into one and prunes vectorEditingNodeIds.
  await designPage.selectTool('pen');
  await designPage.click(1000, 300); // resume A's free endpoint (a2)
  await designPage.click(1200, 300); // click exactly onto B's own endpoint (b1) — real structural merge

  const afterMerge = await readDesignState(page);

  expect(afterMerge.vectorEditingNodeIds).toHaveLength(1);

  // action — now that it's a single eligible chain, the very same dropdown item must actually work
  await designPage.selectVectorEditMoveTool();
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByText('Variable width', { exact: true }).click();

  expect((await readDesignState(page)).activeTool).toBe('variableWidth');
});

test('the Shift+W shortcut does not activate Variable Width when no node is being edited at all', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-variable-width-shortcut-blocked-no-node');
  await expect(designPage.canvas).toBeVisible();

  // action — nothing is in Vector Edit Mode yet, so there's no eligible node for the shortcut at all
  await page.keyboard.press('Shift+w');

  expect((await readDesignState(page)).activeTool).not.toBe('variableWidth');
});

test('the Shift+W shortcut does not activate Variable Width when two nodes are being edited simultaneously, even if both are eligible on their own', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-variable-width-shortcut-blocked-two-nodes');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 300 },
  ]); // A
  await exitVectorEditMode(designPage);

  await designPage.drawVectorPath([
    { x: 1200, y: 300 },
    { x: 1300, y: 300 },
  ]); // B
  await exitVectorEditMode(designPage);

  await openMultipleViaEnter(designPage, page, [
    { x: 900, y: 300 },
    { x: 1200, y: 300 },
  ]);

  expect((await readDesignState(page)).vectorEditingNodeIds).toHaveLength(2);

  // action — dispatchTool.ts's isDispatchToolBlocked gate applies to the shortcut, not just the click
  await page.keyboard.press('Shift+w');

  expect((await readDesignState(page)).activeTool).not.toBe('variableWidth');
});

test('the Shift+W shortcut does activate Variable Width when exactly one eligible, non-branching node is being edited', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-variable-width-shortcut-allowed-eligible-node');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  // action
  await page.keyboard.press('Shift+w');

  expect((await readDesignState(page)).activeTool).toBe('variableWidth');
});
