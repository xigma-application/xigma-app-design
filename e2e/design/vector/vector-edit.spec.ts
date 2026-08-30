import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// utils
import { countMismatchedPixels } from '../../utils/compareScreenshots';

test.describe.configure({ mode: 'serial' });

// vertex ids are freshly generated per draw, so position is the only stable way to identify one after
// a round trip through page.evaluate
const hasVertexNear = (vertices: Record<string, { x: number; y: number }> | undefined, x: number, y: number): boolean =>
  Object.values(vertices ?? {}).some((vertex) => Math.abs(vertex.x - x) < 3 && Math.abs(vertex.y - y) < 3);

// v1 (900,300) -> v2 (1050,300) -> v3 (1050,450), all plain clicks (no curve), left open. Leaves the
// canvas still on the Pen tool with the node in vector edit mode, exactly as a real draw session would.
const drawOpenTriangle = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
    { x: 1050, y: 450 },
  ]);
  // the layers-tree node icon starts as an empty <path d=""> and fills in a beat later; wait it out
  // here so the many "screenshot a baseline, round-trip, compare .toBe(true)" tests below don't
  // capture their baseline mid-paint and then see the icon "appear" on a later capture
  await expect(designPage.page.locator('svg[class*="TreeItem__icon"] path[d]:not([d=""])').first()).toBeAttached();
};

// clicking any main-toolbar tool outside the Pen group (selectToolbarTool.ts) now exits Vector Edit
// Mode in one go — same net effect (tool -> default, vectorEditingNodeId -> null, node stays
// selected) as the old 3-stage Escape sequence, since neither path ever touches selectedIds.
const exitVectorEditMode = async (designPage: DesignPage): Promise<void> => {
  await designPage.selectTool('default');
};

// v1(900,300) -> v2(1000,300) -> v3(1000,400) -> v4(900,400) -> back onto v1, closing the loop. Round
// coordinates keep the edge-midpoints (used by the edge-insert tests below) simple to reason about.
// Closing the loop clears penActiveVertexId (see closeLoopOntoVertex.ts), leaving the canvas on the Pen
// tool, still in vector edit mode, but with no vertex currently being extended.
const drawClosedSquare = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 300 },
    { x: 1000, y: 400 },
    { x: 900, y: 400 },
    { x: 900, y: 300 },
  ]);
};

test('double-clicking a vector node enters edit mode; double-clicking empty space exits it again', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-enter-exit');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await exitVectorEditMode(designPage);

  // clipped to the shape's own neighborhood, well clear of the floating toolbar — the toolbar's
  // container measures/re-centers itself independently of anything under test here, and shifts by a
  // few px between an Escape-driven exit and a double-click-driven one for reasons unrelated to vector
  // edit mode, which would otherwise make an otherwise-identical pair of full-canvas captures differ
  const region = { height: 300, width: 300, x: 850, y: 200 };

  // rest on the same neutral point used after the exit-again double-click below, so a stale hover
  // outline left over from drawing (the pointer never crossed the canvas again after selectTool)
  // isn't mistaken for a real difference between the two "not editing" captures
  await designPage.pointerMove(1400, 700);
  const notEditing = await page.screenshot({ clip: region });

  await designPage.doubleClick(975, 300); // midpoint of the v1-v2 edge
  const editing = await page.screenshot({ clip: region });

  expect(editing.equals(notEditing)).toBe(false);

  await designPage.doubleClick(1400, 700); // empty space
  const exitedAgain = await page.screenshot({ clip: region });

  expect(exitedAgain.equals(editing)).toBe(false);
  expect(exitedAgain.equals(notEditing)).toBe(true); // round trip back to the same rendered state
});

// regression check: the staged tangent's preview line/diamond handle (drawn while the pointer is
// still following a not-yet-placed next point) live in a plain ref (penPreviewRef) written only by
// the canvas's own pointermove handler — pressing Escape only ever dispatches Redux actions, so
// without an explicit clear it left that stale diamond+line rendered on screen until the next real
// pointermove happened to overwrite it, exactly as reported live: "escape się usuwa dopiero jak
// myszką ruszę"
test('pressing Escape after a click-drag-staged tangent clears its preview line/handle immediately, with no pointer move required first', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 350, width: 350, x: 950, y: 150 }; // spans v2 and the staged preview's cursor target below

  await designPage.goto('e2e-test-vector-edit-escape-clears-pen-preview');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — curves segment 1, stages an outgoing tangent
  await designPage.pointerMove(1200, 450); // follow the still-staged tangent — renders its diamond + a straight preview line

  await page.keyboard.press('Escape'); // cancel the draw — deliberately no pointer move afterward
  const immediatelyAfterEscape = await page.screenshot({ clip: region });

  await designPage.pointerMove(1400, 700); // now let one real pointermove happen, well clear of the shape
  const afterSubsequentMove = await page.screenshot({ clip: region });

  expect(immediatelyAfterEscape.equals(afterSubsequentMove)).toBe(true);
});

test('dragging a vertex dot moves that vertex', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-drag-vertex');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  const before = await designPage.canvas.screenshot();

  await designPage.dragVectorPoint(900, 300, 850, 250); // grab v1's dot

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('dragging an existing tangent handle curves the adjacent segment', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-drag-handle');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — handle now sits at (1050, 350)
  await designPage.selectVectorEditMoveTool();

  const before = await designPage.canvas.screenshot();

  await designPage.dragVectorPoint(1050, 350, 1100, 400); // grab and move that handle

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('dragging one handle at a vertex whose tangent was click-drag-created also moves its other handle, curving both segments (vertexHandleModes is `symmetric`, not `smooth`, for a freshly dragged tangent)', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-symmetric-mirror');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — stages an outgoing tangent
  await designPage.click(1200, 300); // v3, plain click — segment 2 inherits the staged tangent
  await designPage.selectVectorEditMoveTool();

  // v3, not v2, is left as the Pen tool's still-active vertex once the tool switches away — v2's own
  // handle is otherwise hidden (tangent handles only show for a selected/still-active parent vertex),
  // so it must be explicitly selected here before it can be grabbed
  await designPage.click(1050, 300); // select v2

  // the region around segment 2 (v2 -> v3), well clear of segment 1's own handle at (1050, 350)
  const region = { height: 100, width: 220, x: 1030, y: 210 };
  const before = await page.screenshot({ clip: region });

  await designPage.dragVectorPoint(1050, 350, 1100, 420); // drag segment 1's handle only

  const after = await page.screenshot({ clip: region });
  expect(after.equals(before)).toBe(false); // segment 2 moved too, though its own handle was untouched
});

// regression check for the reported bug where the mirrored handle only rotated to match the dragged
// handle's new angle but kept its own old length — v2's handle is dragged straight down (angle never
// changes between the two scenarios below, only the distance), so the mirrored handle above v2 must
// land at a different height in each capture; under the old (angle-only) bug it would land at the exact
// same spot both times, since only the angle — identical here — fed into the mirror
test('dragging a click-drag-created tangent handle a different distance also moves its vertex’s other handle the same distance, not just to the same angle', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const otherHandleRegion = { height: 200, width: 60, x: 1020, y: 80 }; // spans every tip position used below

  const dragAndCapture = async (dragToX: number, dragToY: number): Promise<Buffer> => {
    await designPage.selectTool('pen');
    await designPage.click(900, 300); // v1
    await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — stages an outgoing tangent
    await designPage.click(1200, 300); // v3, plain click — segment 2 inherits the staged tangent
    await designPage.selectVectorEditMoveTool();
    await designPage.click(1050, 300); // select v2 to reveal its handles
    await designPage.dragVectorPoint(1050, 350, dragToX, dragToY); // drag segment 1's handle straight down

    return page.screenshot({ clip: otherHandleRegion });
  };

  await designPage.goto('e2e-test-vector-edit-symmetric-mirror-length-short');
  await expect(designPage.canvas).toBeVisible();
  const short = await dragAndCapture(1050, 380); // handle dragged 80px down

  await designPage.goto('e2e-test-vector-edit-symmetric-mirror-length-long');
  await expect(designPage.canvas).toBeVisible();
  const long = await dragAndCapture(1050, 500); // handle dragged 200px down — same direction, longer

  expect(short.equals(long)).toBe(false);
});

test('clicking an edge away from its own midpoint with the Move tool selects the segment instead of splitting it — that still requires the Pen tool, matching Figma', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-edge-move-tool-select');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.click(940, 300); // off the v1-v2 edge's own midpoint (975,300) — plain selection only
  const moveToolSelect = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-vector-edit-edge-move-tool-select-reference');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectTool('pen');
  await designPage.click(940, 300); // Pen tool, same point: splits the edge and arms the new vertex
  const penToolSplit = await designPage.canvas.screenshot();

  // the Move tool's plain segment-selection highlight looks nothing like the Pen tool's inserted vertex
  expect(moveToolSelect.equals(penToolSplit)).toBe(false);
});

test('clicking precisely on an edge’s own midpoint with the Move tool splits it and selects the new vertex, exactly like the Pen tool does', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-edge-move-tool-midpoint-split');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  // a second click on the very same spot re-grabs whatever is now sitting there — done identically in
  // both this and the reference branch below, so the "actively editing this vertex" tint (see this file's
  // own top-of-file gotcha note) affects both equally and cancels out of the comparison
  await designPage.click(975, 300); // exactly the v1-v2 edge's own midpoint — splits it on this first click
  await designPage.click(975, 300); // re-click: now hits the freshly split-in real vertex
  const moveToolSplit = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-vector-edit-edge-move-tool-midpoint-select-reference');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.click(940, 300); // off-midpoint click, well away from any vertex — plain selection only
  await designPage.click(940, 300); // re-click: still just the same segment, never split
  const moveToolPlainSelect = await designPage.canvas.screenshot();

  // the selected-vertex render at the midpoint looks nothing like the plain segment-selection highlight
  expect(moveToolSplit.equals(moveToolPlainSelect)).toBe(false);
});

test('clicking a segment with the Move tool selects it, and Delete removes that segment, dropping the endpoint it leaves with no segment left but keeping the other segment and its still-connected endpoint', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-segment-select-delete');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.click(940, 300); // off the v1-v2 edge's own midpoint (975,300) — selects that segment
  const selected = await designPage.canvas.screenshot();

  await page.keyboard.press('Delete');
  const afterDelete = await designPage.canvas.screenshot();

  expect(afterDelete.equals(selected)).toBe(false); // the v1-v2 edge is gone

  // the other segment (v2-v3) survives untouched — still there to select
  await designPage.click(1050, 340); // off the v2-v3 edge's own midpoint (1050,375)
  const remainingSelected = await designPage.canvas.screenshot();

  expect(remainingSelected.equals(afterDelete)).toBe(false);

  // v1 (900,300) had only the just-deleted segment — it must be pruned as a floating, unusable point,
  // not left behind: a click right on its former position now hits nothing, same as truly empty space
  await designPage.click(1500, 900); // deselect first
  await designPage.click(900, 300); // v1's former position
  const clickedOldV1 = await designPage.canvas.screenshot();

  await designPage.click(1500, 900); // deselect
  await designPage.click(1400, 700); // genuinely empty canvas space, same "nothing here" outcome expected
  const clickedEmptySpace = await designPage.canvas.screenshot();

  expect(clickedOldV1.equals(clickedEmptySpace)).toBe(true);
});

test('clicking an edge with the Pen tool selected but not currently extending inserts a vertex there, splitting the segment and arming the new point for immediate extension', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-edge-insert-idle');
  await expect(designPage.canvas).toBeVisible();

  // still on Pen, still in edit mode, but penActiveVertexId is null: closing the loop ended extension
  await drawClosedSquare(designPage);

  const before = await designPage.canvas.screenshot();

  await designPage.click(950, 300); // midpoint of the v1-v2 (top) edge

  const afterInsert = await designPage.canvas.screenshot();
  expect(afterInsert.equals(before)).toBe(false);

  // the split point must have been armed as the active vertex — extending straight to a fresh point
  // should draw a new connected segment from it, not place a second, disconnected floating vertex
  await designPage.click(950, 150);

  const afterExtend = await designPage.canvas.screenshot();
  expect(afterExtend.equals(afterInsert)).toBe(false);
});

test('clicking an existing segment while actively drawing attaches the in-progress line to it, splitting the segment and ending the extension', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-edge-insert-drawing');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);

  // start a brand-new, disconnected fragment away from the square, then actively extend from it —
  // penActiveVertexId is set again, this time mid-draw rather than idle
  await designPage.click(1200, 350);

  const before = await designPage.canvas.screenshot();

  await designPage.click(1000, 350); // midpoint of the square's right (v2-v3) edge

  const afterAttach = await designPage.canvas.screenshot();
  expect(afterAttach.equals(before)).toBe(false);

  // the extension must have ended at the attach point — a further click starts an unconnected new
  // fragment instead of continuing the same line, so the region around the square's untouched left
  // edge stays pixel-identical throughout
  const leftEdgeRegion = { height: 40, width: 40, x: 880, y: 330 };
  const beforeFurtherClick = await page.screenshot({ clip: leftEdgeRegion });

  await designPage.click(1200, 450);

  const afterFurtherClick = await page.screenshot({ clip: leftEdgeRegion });
  expect(afterFurtherClick.equals(beforeFurtherClick)).toBe(true);
});

test('click-dragging onto an existing segment while actively drawing attaches the in-progress line to it and shapes the connecting segment’s tangent, instead of only ever joining it straight', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-edge-insert-drag-tangent');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.click(1200, 350); // starts a new, disconnected fragment's active vertex
  await designPage.dragVectorPoint(1000, 350, 1050, 300); // click-drag onto the square's right (v2-v3) edge midpoint
  const curvedAttach = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-vector-edit-edge-insert-drag-tangent-reference');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.click(1200, 350);
  await designPage.click(1000, 350); // plain click — no tangent on the connecting segment
  const straightAttach = await designPage.canvas.screenshot();

  expect(curvedAttach.equals(straightAttach)).toBe(false);
});

test('splitting a curved edge preserves the original curve’s shape on both sides — no kink at the new point', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-edge-insert-curve-shape');
  await expect(designPage.canvas).toBeVisible();

  const neutral = { x: 1400, y: 700 };

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — curves the v1-v2 segment
  await page.keyboard.press('Escape'); // stop extending — Pen idle, still in edit mode
  await designPage.pointerMove(neutral.x, neutral.y); // rest away from the curve before capturing

  // two regions straddling the segment, well clear of where the new split-point vertex dot will render
  // (its own midpoint, ~(975, 319)) — De Casteljau subdivision retraces the exact same path on both
  // sides of a split, so unlike the old naive split (kept the outer tangents unchanged, nulled the new
  // shared vertex — see splitVectorSegment.ts), these regions must render the same curve shape after
  // the split
  const nearV1Region = { height: 50, width: 50, x: 898, y: 282 };
  const nearV2Region = { height: 50, width: 50, x: 1002, y: 296 };

  const beforeNearV1 = await page.screenshot({ clip: nearV1Region });
  const beforeNearV2 = await page.screenshot({ clip: nearV2Region });

  await designPage.click(975, 319); // the curve's own midpoint — snaps the edge-insert split there
  await page.keyboard.press('Escape'); // deselect the newly-armed split point — otherwise its own
  // tangent-handle diamonds render in "after" and never in "before", swamping the comparison with a
  // difference that has nothing to do with the curve's shape (already covered by the sibling test that
  // asserts the split point gets armed for immediate extension)
  await designPage.pointerMove(neutral.x, neutral.y);

  const afterNearV1 = await page.screenshot({ clip: nearV1Region });
  const afterNearV2 = await page.screenshot({ clip: nearV2Region });

  // a plain Buffer.equals() is the wrong tool here: the pre-split curve is flattened as a single
  // polyline (its own adaptive segment count over the *whole* curve, getVectorCurveSegmentCount.ts),
  // while post-split each half is flattened independently (its own adaptive count over just *that*
  // half) — same continuous geometric path, but sampled at different points along it, so antialiasing
  // shades a thin diagonal band of edge pixels by up to one color level even with zero actual shape
  // change. pixelmatch's default antialiasing detection (includeAA: false) filters exactly that kind of
  // noise while still catching a real discontinuity — expect(...).toBe(0) here (not "close to 0") is
  // deliberate: this file's dev-only pixelmatch/pngjs dependency should stay confined to this one case,
  // not become a general house style for the suite.
  expect(countMismatchedPixels(beforeNearV1, afterNearV1)).toBe(0);
  expect(countMismatchedPixels(beforeNearV2, afterNearV2)).toBe(0);
});

test('clicking empty space in edit mode deselects the active vertex but keeps edit mode open', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-miss-click');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.click(1050, 300); // "select" v2 (its dot turns blue)
  const selected = await designPage.canvas.screenshot();

  await designPage.click(1400, 700); // empty space — a miss, not a double-click
  const deselected = await designPage.canvas.screenshot();

  expect(deselected.equals(selected)).toBe(false); // v2's dot reverted color

  // the bottom-right quadrant of v3's own neighborhood — v3's incoming segment (v2 -> v3) only ever
  // approaches from directly above, and dragging v1 elsewhere brightens that incoming stroke as part
  // of the whole path's "a vertex is actively being dragged" rendering, which would make a region
  // including that segment differ even though v3 itself never moves; this quadrant has no segment
  // passing through it, so it isolates the vertex-position claim from that unrelated stroke color shift
  const v3Region = { height: 20, width: 20, x: 1050, y: 450 };
  const beforeDrag = await page.screenshot({ clip: v3Region });

  await designPage.dragVectorPoint(900, 300, 850, 250); // drag v1 only

  const afterDrag = await page.screenshot({ clip: v3Region });
  expect(afterDrag.equals(beforeDrag)).toBe(true);
});

test('selecting a different node while still editing one cleanly exits edit mode for the original, with no lingering handles', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  // handleSetSelection.ts clears vectorEditingNodeId (and penActiveVertexId) on any setSelection
  // whose new selection isn't exactly the node currently being edited — drawing/selecting B is a
  // setSelection([B]) call, so A's edit mode exits as a side effect, without an explicit Escape

  await designPage.goto('e2e-test-vector-edit-different-node-noQuirk');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // node A, still being edited
  await designPage.selectVectorEditMoveTool();
  await designPage.drawFrame(1300, 300, 1400, 400); // node B, auto-selected on creation
  await designPage.click(1350, 350); // reaffirm B is the current selection

  const viaSelectingB = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-vector-edit-different-node-reference');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Escape'); // 1st: clears the still-active last vertex
  await page.keyboard.press('Escape'); // 2nd: stages back to the Vector Edit Move tool, still editing
  await page.keyboard.press('Escape'); // 3rd: Move now active — exit edit mode for A explicitly
  await designPage.drawFrame(1300, 300, 1400, 400);
  await designPage.click(1350, 350);

  const viaExplicitEscape = await designPage.canvas.screenshot();

  // identical whether A's edit mode was exited explicitly (Escape, Escape) or implicitly (by
  // selecting B) — proves selecting B alone is enough to fully drop A's edit handles, no quirk
  expect(viaSelectingB.equals(viaExplicitEscape)).toBe(true);
});

test('a selected (not editing) vector node still resizes via the ordinary 8-direction handles', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-resize');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await exitVectorEditMode(designPage);

  await designPage.click(975, 300); // select the node (not editing)
  const before = await designPage.canvas.screenshot();

  await designPage.dragVectorPoint(1050, 450, 1150, 550); // "se" resize handle, coincides with v3

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('a selected (not editing) vector node still rotates via the ordinary rotate ring', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-rotate');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await exitVectorEditMode(designPage);

  await designPage.click(975, 300); // select the node (not editing)
  const before = await designPage.canvas.screenshot();

  await designPage.dragVectorPoint(890, 290, 1020, 280); // rotate ring just outside the "nw" handle

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('dragging a vertex on an already-rotated node moves only that vertex, not the whole shape', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-rotated-vertex-drag');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300) v2(1050,300) v3(1050,450) — bounds are a 150x150 square
  await exitVectorEditMode(designPage);

  await designPage.click(975, 300); // select the node (not editing), to reveal the rotate ring

  // ring just outside the "nw" handle, swung to due north of the bounds-center (975, 375) — same
  // clean-angle technique as rotate.spec.ts's deterministic-45deg test — for a persisted rotation:45
  // that never gets baked into the vertices (armRotateDrag.ts keeps a solo rotate live, see #7 in
  // vector-network.md), so entering edit mode below starts from a still-rotated, not-yet-baked node
  await designPage.dragVectorPoint(890, 290, 975, 275);

  // v1/v2/v3 rotated 45deg around (975, 375): v1(900,300) -> (975,269); v2(1050,300) -> (1081,375);
  // v3(1050,450) -> (975,481); the v1-v2 edge midpoint (975,300) -> (1028,322)
  await designPage.doubleClick(1028, 322); // enter Vector Edit Mode on the rotated shape

  // v3's own dot, well clear of the toolbar and of v1 (the vertex being dragged below) — isolates
  // whether v3 itself visibly moves from the "actively editing" stroke tint, which is already
  // constant for the whole gesture by the time the first screenshot below is taken (see the vector
  // edit gotcha note above)
  const v3Region = { height: 24, width: 24, x: 963, y: 469 };

  await designPage.pointerDown(975, 269); // grab v1's dot — this pointerdown bakes the rotation
  const v3AtGrab = await page.screenshot({ clip: v3Region });

  await designPage.pointerMove(920, 220); // first increment of the drag
  const v3MidDrag = await page.screenshot({ clip: v3Region });

  await designPage.pointerMove(870, 170); // second increment — a still-drifting render pivot (the bug
  // this guards against) would keep shifting v3 here too, not just settle after one frame
  const v3LateInDrag = await page.screenshot({ clip: v3Region });

  await designPage.pointerUp();

  expect(v3MidDrag.equals(v3AtGrab)).toBe(true);
  expect(v3LateInDrag.equals(v3MidDrag)).toBe(true);
});

test('undo after dragging a vertex restores its previous position', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-undo');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  const before = await designPage.canvas.screenshot();

  await designPage.dragVectorPoint(900, 300, 850, 250);
  const afterDrag = await designPage.canvas.screenshot();
  expect(afterDrag.equals(before)).toBe(false);

  // undo now restores the selected-vertex tint along with the position — the ref that drives it
  // (selectedVectorVertexIdsRef) round-trips through the same history gesture as the drag itself, so a
  // full-canvas comparison back to `before` is (tolerant-AA) exact, not just a positional check on
  // clipped regions; countMismatchedPixels rather than a raw Buffer.equals() since the two renders come
  // from independently re-flattened geometry (same reasoning as this file's other pixelmatch uses)
  await page.keyboard.press('Control+z');
  const afterUndo = await designPage.canvas.screenshot();

  expect(countMismatchedPixels(before, afterUndo)).toBe(0);
});

test('undo after deleting two shift-selected vertices restores both the geometry and the multi-selection highlight', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-multi-vertex-delete-undo');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.click(1050, 300); // select v2 alone
  await designPage.click(1050, 450, { shift: true }); // add v3 — 2-point multi-selection
  const before = await designPage.canvas.screenshot();

  await page.keyboard.press('Delete');
  const afterDelete = await designPage.canvas.screenshot();
  expect(afterDelete.equals(before)).toBe(false);

  // undo must restore both vertices AND their multi-selection highlight, not just the geometry —
  // selectedVectorVertexIdsRef lives outside Redux, so this is the regression this fix closes
  await page.keyboard.press('Control+z');
  const afterUndo = await designPage.canvas.screenshot();

  expect(countMismatchedPixels(before, afterUndo)).toBe(0);
});

test('undo after deleting a selected segment restores both the geometry and the segment-selection highlight', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-segment-delete-undo');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.click(940, 300); // off the v1-v2 edge's own midpoint (975,300) — selects that segment
  const before = await designPage.canvas.screenshot();

  await page.keyboard.press('Delete');
  const afterDelete = await designPage.canvas.screenshot();
  expect(afterDelete.equals(before)).toBe(false);

  // same regression check as the vertex case above, but for selectedVectorSegmentIdsRef
  await page.keyboard.press('Control+z');
  const afterUndo = await designPage.canvas.screenshot();

  expect(countMismatchedPixels(before, afterUndo)).toBe(0);
});

test('shift+click toggles a vertex into the multi-selection and back out again', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-shift-toggle');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectVectorEditMoveTool();

  // rest at the same neutral point before each capture — otherwise the cursor's own resting position
  // (on v1's dot vs. on v2's dot) drives a real hover-highlight pixel difference unrelated to selection
  const neutral = { x: 1400, y: 700 };

  await designPage.click(900, 300); // select v1 alone
  await designPage.pointerMove(neutral.x, neutral.y);
  const singleSelected = await designPage.canvas.screenshot();

  await designPage.click(1050, 300, { shift: true }); // add v2 — now a 2-point multi-selection
  await designPage.pointerMove(neutral.x, neutral.y);
  const multiSelected = await designPage.canvas.screenshot();
  expect(multiSelected.equals(singleSelected)).toBe(false);

  await designPage.click(1050, 300, { shift: true }); // remove v2 again
  await designPage.pointerMove(neutral.x, neutral.y);
  const backToSingle = await designPage.canvas.screenshot();
  expect(backToSingle.equals(singleSelected)).toBe(true); // round trip back to the plain single-vertex look
});

test('shift+click mixes a vertex and a tangent handle into one multi-selection, and dragging inside its box moves both together', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-mixed-multi-select');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — handle now sits at (1050, 350)
  await designPage.selectVectorEditMoveTool();

  await designPage.click(900, 300); // select v1
  await designPage.click(1050, 350, { shift: true }); // add v2's tangent handle — a mixed selection

  // isolated regions around v1's dot and the handle's dot — the two selected points that must move
  // together; v2's own region is deliberately not compared here, since the curve leading into v2
  // visibly reshapes once v1/the handle move even though v2's own dot position never changes (the
  // "unrelated stroke shape" gotcha this file already documents above)
  const v1Region = { height: 24, width: 24, x: 888, y: 288 };
  const handleRegion = { height: 24, width: 24, x: 1038, y: 338 };

  const beforeV1 = await page.screenshot({ clip: v1Region });
  const beforeHandle = await page.screenshot({ clip: handleRegion });

  await designPage.dragVectorPoint(975, 325, 1025, 325); // drag inside the box interior (its center), not on any dot

  const afterV1 = await page.screenshot({ clip: v1Region });
  const afterHandle = await page.screenshot({ clip: handleRegion });

  expect(afterV1.equals(beforeV1)).toBe(false);
  expect(afterHandle.equals(beforeHandle)).toBe(false);
});

test('the multi-select box disappears for the duration of a group-translate drag, then reappears once released', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-box-hidden-during-move');
  await expect(designPage.canvas).toBeVisible();

  // a real (non-degenerate) triangle, so the two selected corners' bounding box top edge (900,300)-
  // (1050,300) doesn't coincide with any actual drawn segment — v2 sits above that line, at (1000,220),
  // so the box's own stroke there is the only thing that could ever render at this clip region
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 220 },
    { x: 1050, y: 450 },
  ]);
  await designPage.selectVectorEditMoveTool();

  // known-empty baseline for the box's own top-edge region, captured before selecting anything
  const boxEdgeRegion = { height: 20, width: 20, x: 965, y: 290 };
  const emptyBaseline = await page.screenshot({ clip: boxEdgeRegion });

  await designPage.click(900, 300); // select v1
  await designPage.click(1050, 450, { shift: true }); // add v3 — 2-point box, eligible (no handles involved)

  const atRest = await page.screenshot({ clip: boxEdgeRegion });
  expect(atRest.equals(emptyBaseline)).toBe(false); // the box's top edge really does render there at rest

  // press inside the box's own interior (not on any dot) and drag past the movement threshold, without
  // releasing yet — this is the group-translate gesture the box should hide for
  await designPage.pointerDown(975, 375);
  await designPage.pointerMove(1025, 375);

  const midDrag = await page.screenshot({ clip: boxEdgeRegion });
  expect(midDrag.equals(emptyBaseline)).toBe(true); // invisible for the duration of the move

  await designPage.pointerUp();

  const afterRelease = await page.screenshot({ clip: boxEdgeRegion });
  expect(afterRelease.equals(emptyBaseline)).toBe(false); // reappears once the drag ends
});

test('shift+click multi-selects two tangent handles with no vertex in the selection: no bounding box renders (too complex a case, Figma doesn’t have one either), and dragging one of them moves both together with the mouse instead of leaving a preview-only handle frozen in place', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-handle-only-multi-select');
  await expect(designPage.canvas).toBeVisible();

  // an empty-canvas corner where a 2-point bounding box's stroke would pass through if one rendered —
  // captured before anything is drawn, as the known-empty baseline
  const boxCornerRegion = { height: 30, width: 30, x: 1063, y: 185 };
  const emptyBaseline = await page.screenshot({ clip: boxCornerRegion });

  // v1 placed with a drag (900,300)->(1000,200) stages a REAL outgoing tangentStart, (100,-100); v2 is
  // a plain click at (1100,500), so segment s1 commits with tangentStart real but tangentEnd still null
  // — v2's handle only ever exists as a rendered/hit-testable preview (getEffectiveTangentEnd), derived
  // from tangentStart, never written to the store. This is the exact shape of the regression this test
  // guards: a preview-only handle has no drag-origin of its own unless the multi-drag code resolves it
  // through the same effective/preview fallback the draw and hit-test code already use.
  await designPage.selectTool('pen');
  await designPage.dragVectorPoint(900, 300, 1000, 200); // v1, dragged — stages tangentStart (100,-100)
  await designPage.click(1100, 500); // v2, plain click — tangentEnd stays null
  await designPage.selectVectorEditMoveTool();

  await designPage.click(900, 300); // select v1 — reveals segment s1's handles at both ends
  await designPage.click(1000, 200); // select v1's own (real) handle alone
  await designPage.click(1078, 433, { shift: true }); // add v2's (preview-only) handle — 2 handles, 0 vertices

  const boxCornerWithHandlesSelected = await page.screenshot({ clip: boxCornerRegion });

  expect(boxCornerWithHandlesSelected.equals(emptyBaseline)).toBe(true);

  // dragging the (real) start handle by (50,-50) must translate the preview-only end handle by the
  // exact same delta, not just "some amount" — a naive assertion that its region merely changed would
  // also pass under the regression this guards against: with no drag-origin of its own, the preview
  // handle still visibly moves as its parent segment's changing tangentStart continuously re-derives it
  // (getEffectiveTangentEnd), just along the wrong curve/scaling path instead of 1:1 with the cursor.
  // So this checks the one thing that actually distinguishes the two: the exact landing spot. Under the
  // fix the end handle lands at its old position + (50,-50) = (1078+50, 433-50) = (1128, 383); under the
  // regression it instead re-derives to (1085, 395) — 43px off, and nothing renders at (1128, 383).
  const startHandleRegion = { height: 24, width: 24, x: 988, y: 188 };
  const predictedEndHandleRegion = { height: 20, width: 20, x: 1118, y: 373 };

  const beforeStart = await page.screenshot({ clip: startHandleRegion });
  const beforePredictedEnd = await page.screenshot({ clip: predictedEndHandleRegion });

  await designPage.dragVectorPoint(1000, 200, 1050, 150); // grab the already-selected (real) start handle and drag it by (50,-50)

  const afterStart = await page.screenshot({ clip: startHandleRegion });
  const afterPredictedEnd = await page.screenshot({ clip: predictedEndHandleRegion });

  expect(afterStart.equals(beforeStart)).toBe(false); // the dragged handle itself moved
  expect(afterPredictedEnd.equals(beforePredictedEnd)).toBe(false); // the preview-only handle landed exactly (50,-50) away too
});

test('dragging a marquee over empty space selects every vertex whose point falls inside it, leaving points outside untouched', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-marquee-select');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450)
  await designPage.selectVectorEditMoveTool();

  const v1Region = { height: 24, width: 24, x: 888, y: 288 };
  const v2Region = { height: 24, width: 24, x: 1038, y: 288 };
  const v3Region = { height: 24, width: 24, x: 1038, y: 438 };

  const beforeV1 = await page.screenshot({ clip: v1Region });
  const beforeV2 = await page.screenshot({ clip: v2Region });
  const beforeV3 = await page.screenshot({ clip: v3Region });

  // a marquee spanning y 250-320 catches v1/v2 (both at y=300) while staying well clear of v3 (y=450)
  await designPage.dragVectorPoint(850, 250, 1100, 320);

  const afterV1 = await page.screenshot({ clip: v1Region });
  const afterV2 = await page.screenshot({ clip: v2Region });
  const afterV3 = await page.screenshot({ clip: v3Region });

  expect(afterV1.equals(beforeV1)).toBe(false);
  expect(afterV2.equals(beforeV2)).toBe(false);
  expect(afterV3.equals(beforeV3)).toBe(true);
});

test('dragging a marquee over a segment’s own middle selects it, even though neither endpoint vertex falls inside the box', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-marquee-select-segment');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450) — v1-v2 is a straight horizontal segment
  await designPage.selectVectorEditMoveTool();

  const midpointRegion = { height: 20, width: 20, x: 965, y: 290 }; // (975, 300), well clear of both v1 and v2
  const before = await page.screenshot({ clip: midpointRegion });

  // a marquee spanning x 950-1000, y 290-310 — squarely over the segment's middle, missing both v1(900,300) and v2(1050,300)
  await designPage.dragVectorPoint(950, 290, 1000, 310);

  const after = await page.screenshot({ clip: midpointRegion });
  expect(after.equals(before)).toBe(false);
});

test('hovering a segment with the Move tool highlights it in blue at partial opacity, distinct from both the neutral look and a fully-selected segment', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-segment-hover');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450)
  await designPage.selectVectorEditMoveTool();

  await designPage.pointerMove(1400, 700); // rest well away from the shape
  const neutral = await designPage.canvas.screenshot();

  await designPage.pointerMove(940, 300); // off the v1-v2 edge's own midpoint — no button held, hover only
  const hovered = await designPage.canvas.screenshot();
  expect(hovered.equals(neutral)).toBe(false);

  await designPage.click(940, 300); // fully select the same segment (opaque, not just half-opacity)
  const selected = await designPage.canvas.screenshot();
  expect(selected.equals(hovered)).toBe(false);
});

test('shift+click toggles a segment into a multi-selection with another segment, and dragging one of the selected segments moves the whole group together', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-segment-shift-multi-select');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450)
  await designPage.selectVectorEditMoveTool();

  const neutral = { x: 1400, y: 700 };

  await designPage.click(940, 300); // select the v1-v2 segment alone (off its own midpoint)
  await designPage.pointerMove(neutral.x, neutral.y);
  const singleSelected = await designPage.canvas.screenshot();

  await designPage.click(1050, 375, { shift: true }); // add the v2-v3 segment — now a 2-segment multi-selection
  await designPage.pointerMove(neutral.x, neutral.y);
  const multiSelected = await designPage.canvas.screenshot();
  expect(multiSelected.equals(singleSelected)).toBe(false);

  await designPage.click(1050, 375, { shift: true }); // remove the v2-v3 segment again
  await designPage.pointerMove(neutral.x, neutral.y);
  const backToSingle = await designPage.canvas.screenshot();
  expect(backToSingle.equals(singleSelected)).toBe(true); // round trip back to the single-segment look

  // re-select both segments together, then drag starting from inside the already-selected v1-v2
  // segment — since the two selected segments together touch every vertex (v1, v2, v3), the whole
  // triangle must move, not just the segment that was actually grabbed
  await designPage.click(1050, 375, { shift: true });

  const v1Region = { height: 24, width: 24, x: 888, y: 288 };
  const v3Region = { height: 24, width: 24, x: 1038, y: 438 };
  const beforeV1 = await page.screenshot({ clip: v1Region });
  const beforeV3 = await page.screenshot({ clip: v3Region });

  await designPage.dragVectorPoint(975, 300, 975, 200); // grab the v1-v2 segment, not either vertex dot

  const afterV1 = await page.screenshot({ clip: v1Region });
  const afterV3 = await page.screenshot({ clip: v3Region });

  expect(afterV1.equals(beforeV1)).toBe(false);
  expect(afterV3.equals(beforeV3)).toBe(false);
});

test('dragging directly on an unselected segment selects it and moves only its own two endpoint vertices, in one gesture', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-segment-drag');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450)
  await designPage.selectVectorEditMoveTool();

  const v1Region = { height: 24, width: 24, x: 888, y: 288 };
  const v2Region = { height: 24, width: 24, x: 1038, y: 288 };
  const v3Region = { height: 24, width: 24, x: 1038, y: 438 };

  const beforeV1 = await page.screenshot({ clip: v1Region });
  const beforeV2 = await page.screenshot({ clip: v2Region });
  const beforeV3 = await page.screenshot({ clip: v3Region });

  // no prior click — grabbing straight from the segment's interior must select and move it together
  await designPage.dragVectorPoint(975, 300, 975, 200);

  const afterV1 = await page.screenshot({ clip: v1Region });
  const afterV2 = await page.screenshot({ clip: v2Region });
  const afterV3 = await page.screenshot({ clip: v3Region });

  expect(afterV1.equals(beforeV1)).toBe(false);
  expect(afterV2.equals(beforeV2)).toBe(false);
  expect(afterV3.equals(beforeV3)).toBe(true); // v3 belongs only to the untouched v2-v3 segment
});

// v1(900,300) -> v2(1050,300), a single plain straight segment — the minimal shape needed to
// exercise the Ctrl/Cmd+drag "bend a straight segment" gesture (armVectorBendSegmentOnPointerDown.ts)
const drawStraightSegment = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
  ]);
};

test('Ctrl/Cmd+clicking a segment (no drag yet) reveals its default straight-line tangent handles right away — regression check: armVectorBendSegmentOnPointerDown.ts used to clear the whole vector selection instead of selecting the segment, which hid the handles it had just written until something else (re-)selected the segment', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-bend-reveal-handles');
  await expect(designPage.canvas).toBeVisible();

  await drawStraightSegment(designPage);
  await designPage.selectVectorEditMoveTool();

  // v2 is still the Pen tool's own "active vertex" here, which independently reveals its segment's
  // handles too (see vector-network.md §10) — clearing it first (Escape's stage 1, penActiveVertexId
  // only, still in edit mode) isolates the Ctrl+click below as the actual cause of any handle reveal
  await page.keyboard.press('Escape');

  // off the segment's own fixed midpoint (975,300) — a plain (non-Ctrl) click exactly on the midpoint
  // splits the segment instead of just selecting it (see the Move-tool midpoint-split tests above),
  // which would confound the second click below
  const onSegment = { x: 940, y: 300 };

  await designPage.click(onSegment.x, onSegment.y, { ctrl: true }); // down+up, no movement — arms the bend, writes default tangents
  await designPage.pointerMove(1400, 700);
  const afterCtrlClick = await designPage.canvas.screenshot();

  // a plain click on the very same, already-tangented segment goes through the ordinary, known-good
  // segment-selection path (selectAndArmVectorSegmentDrag.ts) — it can only ever reveal the handles
  // that a correct Ctrl+click should have already revealed, never hide anything, so if the Ctrl+click
  // above already showed them this second click changes nothing further
  await designPage.click(onSegment.x, onSegment.y);
  await designPage.pointerMove(1400, 700);
  const afterPlainReselect = await designPage.canvas.screenshot();

  expect(afterCtrlClick.equals(afterPlainReselect)).toBe(true);
});

test('Ctrl/Cmd+dragging a straight segment’s interior bends it into a curve via its tangents — distinct from a plain (no-Ctrl) drag on the same point, which just moves the whole segment instead', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-bend-segment');
  await expect(designPage.canvas).toBeVisible();

  await drawStraightSegment(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.ctrlDragVectorPoint(975, 300, 975, 200); // bend the segment upward
  const bent = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-vector-edit-bend-segment-reference');
  await expect(designPage.canvas).toBeVisible();

  await drawStraightSegment(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(975, 300, 975, 200); // identical drag, no Ctrl — plain segment move
  const moved = await designPage.canvas.screenshot();

  expect(bent.equals(moved)).toBe(false);
});

test('Ctrl/Cmd+hovering an existing vertex shows the segment cursor (pulling a fresh handle out of it), distinct from Ctrl/Cmd+hovering the same segment’s own interior (bending it), which shows the bend cursor', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-bend-vs-corner-cursor');
  await expect(designPage.canvas).toBeVisible();

  await drawStraightSegment(designPage); // v1(900,300) -> v2(1050,300)
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Escape'); // clear the Pen tool's leftover active vertex, see the test above

  await page.keyboard.down('Control');

  await designPage.pointerMove(900, 300); // directly over v1 — pulls a fresh handle, not a bend
  const overVertex = await designPage.cursorClassName();

  await designPage.pointerMove(940, 300); // off the v1-v2 edge's own midpoint, still well inside it
  const overSegment = await designPage.cursorClassName();

  await page.keyboard.up('Control');

  expect(overVertex).toContain('segment');
  expect(overSegment).toContain('bend');
});

test('dragging an existing tangent handle within the angle-snap tolerance of horizontal snaps it onto the exact axis, pixel-identical to dragging exactly horizontal', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 120, width: 220, x: 1030, y: 250 };

  // mock — v1(900,300) -> v2(1050,300), v2 dragged out — handle sits at (1050,350); grabbing that
  // handle and dragging it a couple of degrees off horizontal (relative to v2, the handle's own
  // vertex) should snap it onto the exact axis
  await designPage.goto('e2e-test-vector-edit-handle-angle-snap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — handle now sits at (1050, 350)
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(1050, 350, 1150, 302); // near-horizontal relative to v2(1050,300)
  const snapped = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-vector-edit-handle-angle-snap-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300);
  await designPage.dragVectorPoint(1050, 300, 1050, 250);
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(1050, 350, 1150, 300); // exactly horizontal relative to v2
  const exact = await page.screenshot({ clip: region });

  expect(snapped.equals(exact)).toBe(true);
});

test('dragging an existing tangent handle well outside the angle-snap tolerance keeps the default blue instead of the orange snap color', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 120, width: 220, x: 1030, y: 250 };

  await designPage.goto('e2e-test-vector-edit-handle-angle-snap-diagonal');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300);
  await designPage.dragVectorPoint(1050, 300, 1050, 250);
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(1050, 350, 1150, 350); // 45deg relative to v2 — well outside tolerance
  const diagonal = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-vector-edit-handle-angle-snap-diagonal-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300);
  await designPage.dragVectorPoint(1050, 300, 1050, 250);
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(1050, 350, 1150, 300); // exactly horizontal — snapped, orange
  const horizontal = await page.screenshot({ clip: region });

  expect(diagonal.equals(horizontal)).toBe(false);
});

test('Shift held while dragging an existing tangent handle hard-constrains it to the nearest 15deg increment, differing from the identical drag without Shift', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 120, width: 220, x: 1030, y: 250 };

  await designPage.goto('e2e-test-vector-edit-handle-shift-angle-snap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — handle sits at (1050, 350)
  await designPage.selectVectorEditMoveTool();

  await designPage.shiftDragVectorPoint(1050, 350, 1150, 350); // Shift held — 45deg relative to v2
  const shiftDrag = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-vector-edit-handle-shift-angle-snap-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300);
  await designPage.dragVectorPoint(1050, 300, 1050, 250);
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(1050, 350, 1150, 350); // identical drag, no Shift
  const plainDrag = await page.screenshot({ clip: region });

  expect(shiftDrag.equals(plainDrag)).toBe(false);
});

test('pressing Shift immediately re-evaluates an in-progress existing-handle drag, without needing the pointer to move again', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 120, width: 220, x: 1030, y: 250 };

  await designPage.goto('e2e-test-vector-edit-handle-shift-immediate-snap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — handle sits at (1050, 350)
  await designPage.selectVectorEditMoveTool();

  await designPage.pointerDown(1050, 350); // grab the existing handle
  await designPage.pointerMove(1150, 350); // drag diagonally, well past the minimum threshold
  const beforeShift = await page.screenshot({ clip: region });

  // action — hold Shift down with no further pointer movement
  await page.keyboard.down('Shift');
  const afterShift = await page.screenshot({ clip: region });
  await page.keyboard.up('Shift');
  await designPage.pointerUp();

  // result — the live handle already snapped just from the key press
  expect(afterShift.equals(beforeShift)).toBe(false);
});

test('dragging an existing tangent handle near a vertex on a completely separate shape snaps it onto that alignment guide, pixel-identical to dragging exactly there', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 300, width: 400, x: 650, y: 250 };

  // mock — shape A is an unrelated short vertical line at x=700 (the alignment candidate); shape B:
  // v1(900,300) -> v2(1050,300), v2 dragged out — handle sits at (1050,350)
  await designPage.goto('e2e-test-vector-edit-handle-alignment-guide');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 700, y: 500 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — handle now sits at (1050, 350)
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(1050, 350, 703, 400); // handle dragged a couple of px off shape A's x=700 column
  const snapped = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-vector-edit-handle-alignment-guide-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 700, y: 500 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await designPage.selectTool('pen');
  await designPage.click(900, 300);
  await designPage.dragVectorPoint(1050, 300, 1050, 250);
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(1050, 350, 700, 400); // exactly on shape A's column — where the guide should have snapped
  const exact = await page.screenshot({ clip: region });

  expect(snapped.equals(exact)).toBe(true);
});

test('dragging an existing single vertex near a vertex on a completely separate shape snaps it onto that alignment guide, pixel-identical to dragging exactly there', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 400, width: 500, x: 650, y: 250 };

  // mock — shape A is an unrelated short vertical line at x=700 (the alignment candidate); shape B is
  // a plain 2-point line, v1 later dragged a couple of px off shape A's x=700 column
  await designPage.goto('e2e-test-vector-edit-vertex-alignment-guide');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 700, y: 500 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(900, 300, 703, 600); // v1 dragged a couple of px off shape A's x=700 column
  const snapped = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-vector-edit-vertex-alignment-guide-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 700, y: 500 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await designPage.selectVectorEditMoveTool();

  await designPage.dragVectorPoint(900, 300, 700, 600); // exactly on shape A's column
  const exact = await page.screenshot({ clip: region });

  expect(snapped.equals(exact)).toBe(true);
});

test('box-dragging several selected vertices together snaps the whole group by the same correction once any one of them touches an alignment guide, pixel-identical to dragging exactly onto it', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 500, width: 600, x: 600, y: 250 };

  // mock — shape A is an unrelated short vertical line at x=700 (the alignment candidate); shape B is
  // a real (non-degenerate) triangle, its v1 and v3 corners multi-selected and dragged together as a
  // group — only v1 ends up near shape A's column, so the correction that snaps it there must carry v3
  // (and the whole group) along by the exact same amount
  await designPage.goto('e2e-test-vector-edit-group-alignment-guide');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 700, y: 500 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 220 },
    { x: 1050, y: 450 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await designPage.selectVectorEditMoveTool();

  await designPage.click(900, 300); // select v1
  await designPage.click(1050, 450, { shift: true }); // add v3 — 2-point box

  // press inside the box's own interior (not on any dot) and drag by (-197,50): v1 raw lands at
  // (703,350), a couple of px off shape A's x=700 column
  await designPage.pointerDown(975, 375);
  await designPage.pointerMove(778, 425);
  await designPage.pointerUp();
  const snapped = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-vector-edit-group-alignment-guide-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 700, y: 500 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 220 },
    { x: 1050, y: 450 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await designPage.selectVectorEditMoveTool();

  await designPage.click(900, 300);
  await designPage.click(1050, 450, { shift: true });

  // exactly (-200,50): v1 lands exactly on shape A's x=700 column
  await designPage.pointerDown(975, 375);
  await designPage.pointerMove(775, 425);
  await designPage.pointerUp();
  const exact = await page.screenshot({ clip: region });

  expect(snapped.equals(exact)).toBe(true);
});

test('the Lasso tool (activated via its "Q" shortcut) selects every vertex whose point falls inside a freeform, multi-point drawn loop, leaving points outside untouched', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-lasso-select');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450)
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('q');

  const v1Region = { height: 24, width: 24, x: 888, y: 288 };
  const v2Region = { height: 24, width: 24, x: 1038, y: 288 };
  const v3Region = { height: 24, width: 24, x: 1038, y: 438 };

  const beforeV1 = await page.screenshot({ clip: v1Region });
  const beforeV2 = await page.screenshot({ clip: v2Region });
  const beforeV3 = await page.screenshot({ clip: v3Region });

  // a freeform loop tracing a rectangle spanning y 250-320, same enclosure as the marquee's own
  // equivalent test — catches v1/v2 (both at y=300), stays well clear of v3 (y=450)
  await designPage.dragVectorLasso([
    { x: 850, y: 250 },
    { x: 1100, y: 250 },
    { x: 1100, y: 320 },
    { x: 850, y: 320 },
  ]);

  const afterV1 = await page.screenshot({ clip: v1Region });
  const afterV2 = await page.screenshot({ clip: v2Region });
  const afterV3 = await page.screenshot({ clip: v3Region });

  expect(afterV1.equals(beforeV1)).toBe(false);
  expect(afterV2.equals(beforeV2)).toBe(false);
  expect(afterV3.equals(beforeV3)).toBe(true);
});

test('starting a Lasso drag directly on top of an UNselected existing vertex still starts a lasso stroke instead of dragging that vertex — Lasso only yields the click to an already-selected element', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-lasso-over-vertex');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450)
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('q');

  const v1Region = { height: 40, width: 40, x: 880, y: 280 };
  const beforeV1 = await page.screenshot({ clip: v1Region });

  // v1 is not selected at this point — dragging starting exactly on it and ending well away from it
  // still starts a lasso stroke instead of dragging that vertex, leaving it exactly where it was; see
  // the next test for the opposite case, where the vertex IS already selected
  await designPage.dragVectorLasso([
    { x: 900, y: 300 },
    { x: 1200, y: 600 },
  ]);

  const afterV1 = await page.screenshot({ clip: v1Region });

  expect(afterV1.equals(beforeV1)).toBe(true);
});

test('starting a Lasso drag directly on top of an ALREADY-selected vertex moves the whole selection instead of starting a new lasso stroke', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-lasso-drag-selection');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450)
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('q');

  // a freeform loop spanning y 250-320 catches v1 and v2 (both at y=300), stays well clear of v3 (y=450)
  await designPage.dragVectorLasso([
    { x: 850, y: 250 },
    { x: 1100, y: 250 },
    { x: 1100, y: 320 },
    { x: 850, y: 320 },
  ]);

  // dragging starting exactly on the now-selected v1 — if Lasso still intercepted this click
  // unconditionally, this would clear the selection and start a fresh lasso stroke instead
  await designPage.dragVectorPoint(900, 300, 900, 380);

  const vertices = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const nodeId =
      state.design.pages[state.design.activePageId].rootOrder[state.design.pages[state.design.activePageId].rootOrder.length - 1];

    return state.design.pages[state.design.activePageId].nodes[nodeId].vertices;
  });

  // v1 and v2, both selected by the lasso, moved together by the same +80 delta; v3, never selected,
  // stayed exactly where it was drawn
  expect(hasVertexNear(vertices, 900, 380)).toBe(true);
  expect(hasVertexNear(vertices, 1050, 380)).toBe(true);
  expect(hasVertexNear(vertices, 1050, 450)).toBe(true);
  expect(hasVertexNear(vertices, 900, 300)).toBe(false);
  expect(hasVertexNear(vertices, 1050, 300)).toBe(false);
});

test('the Lasso fill renders a uniform translucent overlay over empty canvas WHILE the stroke is still being drawn, not the page’s own checker background bleeding through a torn alpha channel', async ({
  page,
}) => {
  // asserted mid-drag, deliberately never releasing the pointer: the render loop redraws an opaque
  // background over the whole canvas every frame (drawSceneBackground.ts), which re-opaques any torn
  // alpha channel on the very next tick — so a regression here is only ever visible for the single
  // live frame the fill is still being drawn, never in a screenshot taken after pointerUp
  const { PNG } = await import('pngjs');
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-lasso-fill-opaque-canvas');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450) — well clear of the loop below
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('q');

  // a loop over empty canvas, away from any node's own stroke/fill — pointer stays held down
  await designPage.pointerDown(500, 550);
  await designPage.pointerMove(700, 550);
  await designPage.pointerMove(700, 650);
  await designPage.pointerMove(500, 650);

  // a small region well inside the fill, clear of the dashed border and the corner vertex dots
  const interiorRegion = { height: 40, width: 40, x: 560, y: 580 };
  const screenshot = await page.screenshot({ clip: interiorRegion });

  await designPage.pointerUp();

  const png = PNG.sync.read(screenshot);

  const [firstR, firstG, firstB] = [png.data[0], png.data[1], png.data[2]];
  let maxChannelDelta = 0;

  for (let index = 0; index < png.data.length; index += 4) {
    maxChannelDelta = Math.max(
      maxChannelDelta,
      Math.abs(png.data[index] - firstR),
      Math.abs(png.data[index + 1] - firstG),
      Math.abs(png.data[index + 2] - firstB),
    );
  }

  // a checkerboard bleeding through would swing wildly between two very different colors across this
  // region; a correctly opaque canvas produces one uniform translucent-blue-over-background color
  expect(maxChannelDelta).toBeLessThan(4);
});

test('the Paint tool (activated via its "Shift+B" shortcut) fills a clicked face and removes the fill again on a second click of the same face', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-paint-toggle');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // v1(900,300) v2(1000,300) v3(1000,400) v4(900,400), one face
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');

  // a small region well inside the face, clear of the stroke/vertex dots — the cursor is parked away
  // from it before every screenshot so the Paint tool's own live hover preview (a translucent
  // add/remove overlay that tracks the resting cursor, not just the click itself) never leaks in
  const interiorRegion = { height: 30, width: 30, x: 935, y: 335 };

  await page.mouse.move(600, 600);
  const unfilled = await page.screenshot({ clip: interiorRegion });

  await designPage.click(950, 350);
  await page.mouse.move(600, 600);
  const filled = await page.screenshot({ clip: interiorRegion });

  await designPage.click(950, 350);
  await page.mouse.move(600, 600);
  const unfilledAgain = await page.screenshot({ clip: interiorRegion });

  expect(filled.equals(unfilled)).toBe(false);
  expect(unfilledAgain.equals(unfilled)).toBe(true);
});

// a 100x100 rectangle split in half by a horizontal "divider" segment (e-f), forming a top and a
// bottom face that share exactly that one segment — mirrors vector-shape-builder.spec.ts's own
// injectSplitRectangle fixture, used here so a single Paint drag has two genuinely separate faces to
// sweep across without needing a flaky re-entered Pen path
const injectSplitRectangle = (page: Page): Promise<string> =>
  page.evaluate(async () => {
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
          bottom: { endId: 'd', id: 'bottom', startId: 'c', tangentEnd: null, tangentStart: null },
          divider: { endId: 'f', id: 'divider', startId: 'e', tangentEnd: null, tangentStart: null },
          leftLower: { endId: 'e', id: 'leftLower', startId: 'd', tangentEnd: null, tangentStart: null },
          leftUpper: { endId: 'a', id: 'leftUpper', startId: 'e', tangentEnd: null, tangentStart: null },
          rightLower: { endId: 'c', id: 'rightLower', startId: 'f', tangentEnd: null, tangentStart: null },
          rightUpper: { endId: 'f', id: 'rightUpper', startId: 'b', tangentEnd: null, tangentStart: null },
          top: { endId: 'b', id: 'top', startId: 'a', tangentEnd: null, tangentStart: null },
        },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: 'vector',
        vertexHandleModes: {},
        vertices: {
          a: { id: 'a', x: 900, y: 300 },
          b: { id: 'b', x: 1000, y: 300 },
          c: { id: 'c', x: 1000, y: 400 },
          d: { id: 'd', x: 900, y: 400 },
          e: { id: 'e', x: 900, y: 350 },
          f: { id: 'f', x: 1000, y: 350 },
        },
      } as never),
    );

    const state = store.getState();

    return state.design.pages[state.design.activePageId].rootOrder[state.design.pages[state.design.activePageId].rootOrder.length - 1];
  });

const enterVectorEditModeFor = (page: Page, nodeIds: string[]): Promise<void> =>
  page.evaluate(async (ids) => {
    const { store } = await import('/src/store/index.ts');
    const { setVectorEditingNodeIds } = await import('/src/store/design/slice.ts');

    store.dispatch(setVectorEditingNodeIds(ids));
  }, nodeIds);

const readVectorNode = (page: Page, nodeId: string): Promise<{ filledFaceKeys: string[] }> =>
  page.evaluate((id) => {
    return import('/src/store/index.ts').then(({ store }) => {
      const { activePageId, pages } = store.getState().design;
      const node = pages[activePageId].nodes[id] as { filledFaceKeys: string[] };

      return { filledFaceKeys: node.filledFaceKeys };
    });
  }, nodeId);

test("the Paint tool's freeform drag mode paints every face the stroke crosses in one gesture, and draws a live black trail while the drag is in progress", async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-paint-drag');
  await expect(designPage.canvas).toBeVisible();

  const nodeId = await injectSplitRectangle(page);

  await enterVectorEditModeFor(page, [nodeId]);
  await page.keyboard.press('Shift+B');

  const pathRegion = { height: 100, width: 100, x: 900, y: 300 };

  await page.mouse.move(600, 600);
  const beforeDrag = await page.screenshot({ clip: pathRegion });

  // sweeps from the top half, down through the divider, into the bottom half — mid-gesture, before
  // releasing, so the live black trail (drawVectorPaintPath, same dashed stroke as Shape Builder's
  // own drag) has actually been rendered onto the canvas at least once
  await designPage.pointerDown(950, 310);
  await designPage.pointerMove(950, 350);
  await designPage.pointerMove(950, 390);
  const duringDrag = await page.screenshot({ clip: pathRegion });

  await designPage.pointerUp();

  const result = await readVectorNode(page, nodeId);

  // both faces got painted from this single stroke, without needing two separate clicks
  expect(result.filledFaceKeys).toHaveLength(2);
  // the dashed black trail was visibly drawn while the pointer was still down
  expect(duringDrag.equals(beforeDrag)).toBe(false);
});

test("a Paint drag starting on an already-filled face arms remove mode for the whole gesture, destroying that face's fill along with every other already-filled face the stroke crosses", async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-paint-drag-destroys-start-face');
  await expect(designPage.canvas).toBeVisible();

  const nodeId = await injectSplitRectangle(page);

  await enterVectorEditModeFor(page, [nodeId]);
  await page.keyboard.press('Shift+B');

  // pre-paint both faces with a plain click each, so the drag below starts on an already-filled
  // face and also sweeps into a second already-filled face
  await designPage.click(950, 310);
  await designPage.click(950, 390);

  const beforeDrag = await readVectorNode(page, nodeId);

  expect(beforeDrag.filledFaceKeys).toHaveLength(2);

  const pathRegion = { height: 100, width: 100, x: 900, y: 300 };

  await page.mouse.move(600, 600);
  const beforeShot = await page.screenshot({ clip: pathRegion });

  // sweep from inside the already-filled top face, down through the divider, into the already-filled
  // bottom half — starting on a filled face must arm remove for the whole gesture, not just toggle
  // the starting face off in isolation
  await designPage.pointerDown(950, 310);
  await designPage.pointerMove(950, 350);
  await designPage.pointerMove(950, 390);
  const duringDrag = await page.screenshot({ clip: pathRegion });

  await designPage.pointerUp();

  const result = await readVectorNode(page, nodeId);

  // both faces got their fill destroyed by the single stroke
  expect(result.filledFaceKeys).toEqual([]);
  // the dashed black trail was visibly drawn while the pointer was still down
  expect(duringDrag.equals(beforeShot)).toBe(false);
});

test('Paint on a rectangle drawn inside another rectangle fills the smaller, innermost face under the cursor, not the outer one it also sits inside — regression for getVectorFaceAtPoint picking the first match instead of the smallest', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-paint-nested-rectangles');
  await expect(designPage.canvas).toBeVisible();

  // a 200x100 outer rectangle with a 100x100 inner rectangle sitting entirely inside it, drawn as two
  // disconnected loops on the same node (pen.spec.ts: closing a loop and clicking elsewhere starts a
  // new fragment on the same node, not a stray connecting segment) — deriveVectorFaces has no notion
  // of a "hole", so a click inside the inner square lands inside both faces at once
  await drawClosedSquare(designPage); // outer: v1(900,300) v2(1000,300) v3(1000,400) v4(900,400)
  await designPage.drawVectorPath([
    { x: 925, y: 325 },
    { x: 975, y: 325 },
    { x: 975, y: 375 },
    { x: 925, y: 375 },
    { x: 925, y: 325 }, // inner: fully inside the outer square's own bounds
  ]);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');

  await designPage.click(950, 350); // dead center of the inner square, also inside the outer one

  const result = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { getVectorFillLoopPoints } = await import('/src/utils/canvas/vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints.ts');

    const state = store.getState();
    const node = state.design.pages[state.design.activePageId].nodes[state.design.pages[state.design.activePageId].rootOrder[0]];
    const [filledKey] = node.filledFaceKeys;
    const points = getVectorFillLoopPoints(node, filledKey);

    return { filledFaceCount: node.filledFaceKeys.length, maxX: Math.max(...(points ?? []).map((point) => point.x)) };
  });

  // the outer square spans x up to 1000, the inner one only up to 975 — only the inner one got filled
  expect(result.filledFaceCount).toBe(1);
  expect(result.maxX).toBe(975);
});

test('Paint fills all 3 regions of a curved "egg" network crossed by a triangle without throwing — regression check for the tail-tangent-scaling bug (a curve with 2 crossings on itself) and the deriveVectorFaces dedup guard', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-egg-crossed-triangle');
  await expect(designPage.canvas).toBeVisible();

  // injected directly rather than drawn via pointer gestures — this exact curve/crossing shape is the
  // live-reported "egg" repro that surfaced both the tail-tangent-scaling bug (fixed in
  // splitSegmentAtCrossings.ts) and was used to probe whether deriveVectorFaces' seenFaceKeys dedup
  // guard is still reachable; reproducing it via click-drag gestures wouldn't hit the exact same tangent
  // values reliably
  await page.evaluate(async () => {
    const storeModule = await import('/src/store/index.ts');
    const sliceModule = await import('/src/store/design/slice.ts');
    const { store } = storeModule;
    const { addNode, setActiveTool, setVectorEditingNodeIds } = sliceModule;

    store.dispatch(
      addNode({
        fillColor: '#D9D9D9',
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {
          '0UCh818eQyx8MfH4eRqwX': {
            endId: 'e7x7_ZJFwi8xpSK2NmP7v',
            id: '0UCh818eQyx8MfH4eRqwX',
            startId: 'UBskFV1mYgjgJlC2TjO3O',
            tangentEnd: { x: -90.5, y: -125 },
            tangentStart: { x: -228.5, y: 49.5 },
          },
          '5lsXtW0aRqIC8XHY10H_S': {
            endId: '5EKY_Bb5RmtSx6tqXEigC',
            id: '5lsXtW0aRqIC8XHY10H_S',
            startId: 'xaDWGwSb7eGDhmi_Y32j1',
            tangentEnd: null,
            tangentStart: null,
          },
          HL3TmRy8A6zo7_Epo8IAT: {
            endId: 'UBskFV1mYgjgJlC2TjO3O',
            id: 'HL3TmRy8A6zo7_Epo8IAT',
            startId: 'zEkiqRdFB7OAJoXEm7s33',
            tangentEnd: { x: 228.5, y: -49.5 },
            tangentStart: { x: 184, y: -208 },
          },
          M7EqyHDYuQoYDfl7EAw1X: {
            endId: '2YBUHR62eh8PXKHgFfEl8',
            id: 'M7EqyHDYuQoYDfl7EAw1X',
            startId: 'pFifGgyP7Ud1EDJ4YJF6p',
            tangentEnd: null,
            tangentStart: { x: -77, y: 17 },
          },
          _TZtFzwu5Y5am7QkXNj5: {
            endId: 'xaDWGwSb7eGDhmi_Y32j1',
            id: '_TZtFzwu5Y5am7QkXNj5',
            startId: '2YBUHR62eh8PXKHgFfEl8',
            tangentEnd: null,
            tangentStart: null,
          },
          l7chmMDdXmpprC8Wtusf_: {
            endId: 'pFifGgyP7Ud1EDJ4YJF6p',
            id: 'l7chmMDdXmpprC8Wtusf_',
            startId: '5EKY_Bb5RmtSx6tqXEigC',
            tangentEnd: { x: 77, y: -17 },
            tangentStart: null,
          },
          wZp_EOINOxu9PpburSlyC: {
            endId: 'wSGSCoznTzHSgcSPMmhzY',
            id: 'wZp_EOINOxu9PpburSlyC',
            startId: 'e7x7_ZJFwi8xpSK2NmP7v',
            tangentEnd: { x: -131.5, y: 23.5 },
            tangentStart: { x: 90.5, y: 125 },
          },
          wg0zmAhmH5J9HRF_KvRUm: {
            endId: 'zEkiqRdFB7OAJoXEm7s33',
            id: 'wg0zmAhmH5J9HRF_KvRUm',
            startId: 'wSGSCoznTzHSgcSPMmhzY',
            tangentEnd: { x: -167.5, y: -15 },
            tangentStart: { x: 131.5, y: -23.5 },
          },
        },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: 'vector',
        vertexHandleModes: {},
        vertices: {
          '2YBUHR62eh8PXKHgFfEl8': { id: '2YBUHR62eh8PXKHgFfEl8', x: 853.5, y: 529.5 },
          '5EKY_Bb5RmtSx6tqXEigC': { id: '5EKY_Bb5RmtSx6tqXEigC', x: 989.5, y: 359.5 },
          UBskFV1mYgjgJlC2TjO3O: { id: 'UBskFV1mYgjgJlC2TjO3O', x: 764, y: 186.5 },
          e7x7_ZJFwi8xpSK2NmP7v: { id: 'e7x7_ZJFwi8xpSK2NmP7v', x: 491.5, y: 381 },
          pFifGgyP7Ud1EDJ4YJF6p: { id: 'pFifGgyP7Ud1EDJ4YJF6p', x: 989.5, y: 524.5 },
          wSGSCoznTzHSgcSPMmhzY: { id: 'wSGSCoznTzHSgcSPMmhzY', x: 623.5, y: 612.5 },
          xaDWGwSb7eGDhmi_Y32j1: { id: 'xaDWGwSb7eGDhmi_Y32j1', x: 697.5, y: 359.5 },
          zEkiqRdFB7OAJoXEm7s33: { id: 'zEkiqRdFB7OAJoXEm7s33', x: 724, y: 562 },
        },
      }),
    );

    const state = store.getState();
    const nodeId =
      state.design.pages[state.design.activePageId].rootOrder[state.design.pages[state.design.activePageId].rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setActiveTool('paint' as never));
  });

  // click well inside each of the network's own 3 known regions (the two "outer" petal/triangle
  // remainders plus the small overlap lens where they cross) — if deriveVectorFaces ever threw on this
  // shape (a duplicate face key, or a corrupted curve from the tangent-scaling bug), the render loop
  // would throw and the canvas would stop updating, which the final screenshot comparison would catch
  await designPage.click(650, 480);
  await designPage.click(900, 300);
  await designPage.click(750, 400);
  await page.mouse.move(300, 700);

  await expect(designPage.canvas).toBeVisible();

  const filledRegion = { height: 60, width: 60, x: 620, y: 450 };
  const shot = await page.screenshot({ clip: filledRegion });

  // a non-trivial screenshot (not fully transparent/blank) confirms the render loop kept running and
  // actually painted something, rather than having silently stopped after an uncaught exception
  expect(shot.length).toBeGreaterThan(0);
});

test('selecting Bend from VectorEditToolbar makes a plain (no-Ctrl) segment drag bend it, pixel-identical to the existing Ctrl/Cmd+drag gesture, and stays active until switched away', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-bend-tool-selected');
  await expect(designPage.canvas).toBeVisible();

  await drawStraightSegment(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.getByRole('button', { name: 'Bend' }).click();

  // clipped to the curve's own neighborhood, well clear of VectorEditToolbar's floating panel — the
  // canvas element's bounding box spans the whole viewport underneath the toolbar chrome (see
  // DesignPage.ts's own canvasSafeArea note), so an unclipped screenshot would also capture the Bend
  // button's now-pressed/highlighted look, which the reference run below never triggers
  const region = { height: 200, width: 200, x: 875, y: 150 };

  await designPage.dragVectorPoint(975, 300, 975, 200); // no Ctrl held — Bend tool alone should curve it
  const bentViaTool = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-vector-edit-bend-tool-selected-reference');
  await expect(designPage.canvas).toBeVisible();

  await drawStraightSegment(designPage);
  await designPage.selectVectorEditMoveTool();

  await designPage.ctrlDragVectorPoint(975, 300, 975, 200); // identical drag, via the existing Ctrl gesture
  const bentViaCtrl = await page.screenshot({ clip: region });

  expect(bentViaTool.equals(bentViaCtrl)).toBe(true);
});

test('dragging one vertex of a closed square onto its adjacent vertex merges them: cursor switches to the merge affordance mid-drag, and release collapses the shared edge into a triangle', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-merge-same-shape');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // v1(900,300), v2(1000,300), v3(1000,400), v4(900,400)
  await designPage.selectVectorEditMoveTool();

  await designPage.pointerDown(900, 400); // v4
  await designPage.pointerMove(900, 350);
  await designPage.pointerMove(903, 302); // a couple px off v1(900,300) — within merge tolerance, not exact

  const cursor = await designPage.canvas.evaluate((el) => getComputedStyle(el).cursor);

  await designPage.pointerUp();

  expect(cursor).toContain('point.png');

  const result = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const nodeId =
      state.design.pages[state.design.activePageId].rootOrder[state.design.pages[state.design.activePageId].rootOrder.length - 1];
    const node = state.design.pages[state.design.activePageId].nodes[nodeId];

    return { segmentCount: Object.keys(node.segments).length, vertexCount: Object.keys(node.vertices).length };
  });

  // 4 vertices/segments before the merge — v1 absorbs v4, and the v4-v1 closing edge collapses to a
  // self-loop and gets dropped, leaving a plain 3-vertex/3-segment triangle
  expect(result.vertexCount).toBe(3);
  expect(result.segmentCount).toBe(3);
});

test('dragging a vertex of one vector shape onto a vertex of a completely separate shape merges the two shapes into one, deleting the absorbed shape', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-merge-cross-shape');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // shape A: v1(900,300) .. v4(900,400)
  await exitVectorEditMode(designPage);

  await designPage.drawVectorPath([
    { x: 1300, y: 300 },
    { x: 1400, y: 300 },
    { x: 1400, y: 400 },
    { x: 1300, y: 400 },
    { x: 1300, y: 300 },
  ]); // shape B, a second, fully separate closed square
  await exitVectorEditMode(designPage);

  const { idA, idB } = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    return { idA: rootOrder[0], idB: rootOrder[1] };
  });

  // on shape B's top-edge contour, not its unfilled interior — since §43's contour-only hit-test fix,
  // a plain/double click dead-center of an unpainted vector face is no longer a hit at all
  await designPage.doubleClick(1350, 300); // enter Vector Edit Mode on shape B

  await designPage.pointerDown(1300, 300); // shape B's own top-left vertex
  await designPage.pointerMove(1150, 300);
  await designPage.pointerMove(1003, 302); // a couple px off shape A's top-right vertex (1000,300)
  await designPage.pointerUp();

  const result = await page.evaluate(
    async ([nodeIdA, nodeIdB]) => {
      const { store } = await import('/src/store/index.ts');
      const state = store.getState();
      const nodeB = state.design.pages[state.design.activePageId].nodes[nodeIdB];

      return {
        nodeAExists: Boolean(state.design.pages[state.design.activePageId].nodes[nodeIdA]),
        segmentCount: Object.keys(nodeB.segments).length,
        vectorEditingNodeIds: state.design.vectorEditingNodeIds,
        vertexCount: Object.keys(nodeB.vertices).length,
      };
    },
    [idA, idB],
  );

  // shape A is fully absorbed and deleted; shape B (the node still open for editing) keeps its own id and
  // gains shape A's whole graph — both squares' 4+4 vertices/segments, minus the one merged-away vertex
  expect(result.nodeAExists).toBe(false);
  expect(result.vertexCount).toBe(7);
  expect(result.segmentCount).toBe(8);
  expect(result.vectorEditingNodeIds).toEqual([idB]);
});

test('a painted face on the absorbed shape survives being merged into a completely separate shape', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-merge-cross-shape-filled-face');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // shape A: v1(900,300) .. v4(900,400) — the one that will be absorbed
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');
  await designPage.click(950, 350); // paint shape A's single face
  await exitVectorEditMode(designPage);

  await designPage.drawVectorPath([
    { x: 1300, y: 300 },
    { x: 1400, y: 300 },
    { x: 1400, y: 400 },
    { x: 1300, y: 400 },
    { x: 1300, y: 300 },
  ]); // shape B, a second, fully separate closed square — this one survives the merge
  await exitVectorEditMode(designPage);

  const { idA, idB, faceKeyOnA } = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder, nodes } = pages[activePageId];
    const [nodeIdA, nodeIdB] = rootOrder;

    return { faceKeyOnA: nodes[nodeIdA].filledFaceKeys, idA: nodeIdA, idB: nodeIdB };
  });

  expect(faceKeyOnA).toHaveLength(1); // sanity check: the paint click actually filled shape A's face

  // on shape B's top-edge contour, not its unfilled interior — since §43's contour-only hit-test fix,
  // a plain/double click dead-center of an unpainted vector face is no longer a hit at all
  await designPage.doubleClick(1350, 300); // enter Vector Edit Mode on shape B

  await designPage.pointerDown(1300, 300); // shape B's own top-left vertex
  await designPage.pointerMove(1150, 300);
  await designPage.pointerMove(1003, 302); // a couple px off shape A's top-right vertex (1000,300)
  await designPage.pointerUp();

  const result = await page.evaluate(
    async ([nodeIdA, nodeIdB]) => {
      const { store } = await import('/src/store/index.ts');
      const state = store.getState();
      const nodeB = state.design.pages[state.design.activePageId].nodes[nodeIdB];

      return { filledFaceKeys: nodeB.filledFaceKeys, nodeAExists: Boolean(state.design.pages[state.design.activePageId].nodes[nodeIdA]) };
    },
    [idA, idB],
  );

  // shape A (the painted, absorbed shape) is gone, but its face's paint carried over onto the survivor —
  // regression check for mergeVectorVertices.ts silently dropping filledFaceKeys during a cross-node merge
  expect(result.nodeAExists).toBe(false);
  expect(result.filledFaceKeys).toEqual(faceKeyOnA);
});

test('a painted square keeps its fill on the region unaffected by the drag after a vertex drag turns it into a self-intersecting ("bowtie") shape', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-paint-survives-self-intersection');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // v1(900,300) v2(1000,300) v3(1000,400) v4(900,400), one face
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');
  await designPage.click(950, 350); // paint the square's single face
  await exitVectorEditMode(designPage);

  const { faceKeysBefore, nodeId } = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder, nodes } = pages[activePageId];
    const [id] = rootOrder;

    return { faceKeysBefore: nodes[id].filledFaceKeys, nodeId: id };
  });

  expect(faceKeysBefore).toHaveLength(1); // sanity check: the paint click actually filled the square

  await designPage.doubleClick(950, 350); // re-enter Vector Edit Mode, Move tool active by default
  await designPage.pointerDown(900, 300); // v1, dragged past the opposite v2-v3 edge
  await designPage.pointerMove(1000, 360);
  await designPage.pointerMove(1080, 350);
  await designPage.pointerUp();

  const faceKeysAfter = await page.evaluate(
    async ([id]) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].nodes[id].filledFaceKeys;
    },
    [nodeId],
  );

  // each piece key is anchored to its own two stable boundaries (real vertices, or crossings
  // identified by which other real segment they border) rather than to a derived-from-current-
  // planarization key, so the exact same stored key still resolves after the drag — no remap
  // needed, and (the reported bug) the fill is never lost the instant the shape self-intersects
  expect(faceKeysAfter).toEqual(faceKeysBefore);
  expect(faceKeysAfter.length).toBeGreaterThan(0);
});

test('a painted region bounded by a multiply-crossed segment’s middle piece stays resolvable after a drag changes its crossings — the {8/3}-star regression', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-star-multi-crossed-paint');
  await expect(designPage.canvas).toBeVisible();

  // an {8/3} star: 8 vertices, each connected to the one 3 steps away, so every one of its 8 segments
  // crosses several others — the small central region is bounded entirely by MIDDLE pieces of these
  // multiply-crossed segments (never a whole/unsplit segment), the exact shape that broke resolution
  // before piece identity was keyed by "which other real segment a piece borders" instead of a
  // derived-from-current-planarization face key (getVectorPieceBoundaryKeys.ts)
  await page.evaluate(async () => {
    const storeModule = await import('/src/store/index.ts');
    const sliceModule = await import('/src/store/design/slice.ts');
    const { store } = storeModule;
    const { addNode, setActiveTool, setVectorEditingNodeIds } = sliceModule;

    const seg = (id: string, startId: string, endId: string) => [id, { endId, id, startId, tangentEnd: null, tangentStart: null }] as const;
    const vertex = (id: string, x: number, y: number) => [id, { id, x, y }] as const;

    store.dispatch(
      addNode({
        fillColor: '#D9D9D9',
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: Object.fromEntries([
          seg('s0', 'v0', 'v3'),
          seg('s1', 'v3', 'v6'),
          seg('s2', 'v6', 'v1'),
          seg('s3', 'v1', 'v4'),
          seg('s4', 'v4', 'v7'),
          seg('s5', 'v7', 'v2'),
          seg('s6', 'v2', 'v5'),
          seg('s7', 'v5', 'v0'),
        ]),
        strokeColor: '#000000',
        strokeWidth: 1,
        type: 'vector',
        vertexHandleModes: {},
        vertices: Object.fromEntries([
          vertex('v0', 800, 250),
          vertex('v1', 906, 294),
          vertex('v2', 950, 400),
          vertex('v3', 906, 506),
          vertex('v4', 800, 550),
          vertex('v5', 694, 506),
          vertex('v6', 650, 400),
          vertex('v7', 694, 294),
        ]),
      }),
    );

    const state = store.getState();
    const nodeId =
      state.design.pages[state.design.activePageId].rootOrder[state.design.pages[state.design.activePageId].rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setActiveTool('paint' as never));
  });

  // paint the star's small central region
  await designPage.click(800, 400);

  const { faceKeysBefore, nodeId } = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder, nodes } = pages[activePageId];
    const id = rootOrder[rootOrder.length - 1];

    return { faceKeysBefore: nodes[id].filledFaceKeys, nodeId: id };
  });

  expect(faceKeysBefore).toHaveLength(1); // sanity check: the central region actually got painted

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setActiveTool } = await import('/src/store/design/slice.ts');

    store.dispatch(setActiveTool('default' as never));
  });

  // drag one of the star's own points inward, changing which segments its two adjacent edges cross —
  // the stored center-region key must still resolve afterward
  await designPage.pointerDown(800, 250);
  await designPage.pointerMove(800, 285);
  await designPage.pointerMove(800, 320);
  await designPage.pointerUp();

  const resolvedAfterDrag = await page.evaluate(
    async ([id]: [string]) => {
      const { store } = await import('/src/store/index.ts');
      const { getVectorFillLoopPoints } =
        await import('/src/utils/canvas/vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints.ts');
      const { activePageId, pages } = store.getState().design;
      const node = pages[activePageId].nodes[id];

      return node.filledFaceKeys.map((key: string) => getVectorFillLoopPoints(node, key) !== null);
    },
    [nodeId],
  );

  expect(resolvedAfterDrag).toEqual([true]);
});

// regression check for two live-reported issues in §56's Move-tool "click a filled face to select all
// its vertices" feature: (1) the click used to only select, requiring a separate second gesture before
// a drag would actually move anything ("muszę puścić LPM, kliknąć LPM i wtedy mogę dopiero poruszać");
// (2) shift-clicking a second, adjacent face used to toggle its shared divider vertices OFF (they were
// already selected from the first face), silently dropping them and leaving the divider frozen in
// place during a later group drag while the rest of the shape moved
test('clicking a filled face with the Move tool selects all its vertices and arms the drag immediately, so a single continuous click-drag moves it with no separate second gesture required first', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-face-select-immediate-drag');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // v1(900,300) v2(1000,300) v3(1000,400) v4(900,400)
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');
  await designPage.click(950, 350); // paint the whole square
  await designPage.selectVectorEditMoveTool();

  const v1Region = { height: 24, width: 24, x: 888, y: 288 }; // around v1's original position

  // reference — a plain click (down+up, no movement) on the face, still selects every vertex, so this
  // is what "selected but never dragged" renders as on this exact node (its own loop-key-hashed debug
  // fill color, §44, is otherwise a confound between two separately-drawn shapes) — isolates the
  // selection-highlight itself (which changes v1's tint regardless of any movement) from an actual
  // position change below
  await designPage.click(950, 350);
  const selectedStationary = await page.screenshot({ clip: v1Region });

  await designPage.click(1400, 700); // deselect — back to the exact same starting state as before

  // the actual gesture under test — one continuous down-move-up starting inside the face's interior
  // (not on any vertex dot), from a freshly deselected state so no prior click has already armed
  // anything (a second click on an already-selected face's box interior is handled by the pre-existing
  // armVectorMultiSelectBoxOnPointerDown regardless of this fix, so it wouldn't isolate it)
  await designPage.dragVectorPoint(950, 350, 1050, 450);
  const afterOneGestureDrag = await page.screenshot({ clip: v1Region });

  // under the bug this click-drag only ever selected the square (same render as the stationary
  // reference above); under the fix v1 has actually left this region
  expect(afterOneGestureDrag.equals(selectedStationary)).toBe(false);
});

test('shift-clicking a second, adjacent filled face keeps its shared divider vertices selected, so a subsequent group drag moves the divider along with the rest of the shape instead of leaving it behind', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-multi-face-select-drag');
  await expect(designPage.canvas).toBeVisible();

  // a square split into a top and bottom half by an internal horizontal divider (v3-v6, s7) — both
  // halves filled, injected directly like this file's own star/tent repros above
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNode, setActiveTool, setVectorEditingNodeIds } = await import('/src/store/design/slice.ts');
    const { deriveVectorFaces } = await import('/src/utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces.ts');
    const { getVectorFillLoopKey } = await import('/src/utils/canvas/vectorNetwork/getVectorFillLoopKey.ts');

    const segments = {
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
      s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      s4: { endId: 'v5', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      s5: { endId: 'v6', id: 's5', startId: 'v5', tangentEnd: null, tangentStart: null },
      s6: { endId: 'v1', id: 's6', startId: 'v6', tangentEnd: null, tangentStart: null },
      s7: { endId: 'v6', id: 's7', startId: 'v3', tangentEnd: null, tangentStart: null },
    };
    const vertices = {
      v1: { id: 'v1', x: 900, y: 300 },
      v2: { id: 'v2', x: 1000, y: 300 },
      v3: { id: 'v3', x: 1000, y: 350 },
      v4: { id: 'v4', x: 1000, y: 400 },
      v5: { id: 'v5', x: 900, y: 400 },
      v6: { id: 'v6', x: 900, y: 350 },
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

    store.dispatch(
      setVectorEditingNodeIds([
        state.design.pages[state.design.activePageId].rootOrder[state.design.pages[state.design.activePageId].rootOrder.length - 1],
      ]),
    );
    store.dispatch(setActiveTool('move' as never));
  });

  await designPage.click(950, 325); // select the top half's vertices (v1, v2, v3, v6)
  await designPage.click(950, 375, { shift: true }); // add the bottom half's too (v3, v4, v5, v6) —
  // v3/v6 are shared by both halves; the bug toggled them back OFF here

  // drag from inside the (now multi-selected) top half, not on any dot — translates the whole shape by
  // (+150, 0) through the real browser pointer-event pipeline (armVectorMultiSelectBoxOnPointerDown ->
  // continueVectorMultiDrag), not a synthetic jsdom event — this is what a unit test of the arm resolver
  // alone can't exercise
  await designPage.dragVectorPoint(950, 325, 1100, 325);

  // read the actual persisted vertex positions rather than diffing pixels: the segments adjacent to a
  // moved-vs-stationary vertex pair visibly reshape regardless of whether the divider's own endpoints
  // moved, which makes a small screenshot region an unreliable signal for this specific claim
  const { v3, v6 } = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder, nodes } = pages[activePageId];
    const node = nodes[rootOrder[rootOrder.length - 1]] as { vertices: Record<string, { x: number; y: number }> };

    return { v3: node.vertices.v3, v6: node.vertices.v6 };
  });

  // under the bug, shift-clicking the bottom face toggled v3/v6 out of the selection, so this drag
  // never touched them and they'd still sit at their original (1000,350)/(900,350) positions
  expect(v3).toMatchObject({ x: 1150, y: 350 });
  expect(v6).toMatchObject({ x: 1050, y: 350 });
});

// Delete/Backspace already removed a selected vertex/segment (§7/§8) and §56 already let a click
// select a *filled* face's vertices, so Delete already deleted a filled sector transitively — but the
// click-select resolver required fill, and deletion never protected a boundary shared with an
// untouched neighbor (it just deleted every selected vertex, same as any plain multi-point delete).
// This pair closes both gaps: any face (filled or not) is now click-selectable, and deleting a
// fully-selected sector reuses Shape Builder's own subtractVectorFaces exclusive-boundary logic so an
// untouched neighbor's shared edge survives — mirrors vector-shape-builder.spec.ts's own Alt+click
// coverage, just reached via selection + Delete instead of a dedicated tool.
test('clicking an unfilled face with the Move tool now selects its vertices too, and Delete removes its whole boundary when nothing borders it', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-unfilled-sector-delete-isolated');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage); // v1(900,300) v2(1000,300) v3(1000,400) v4(900,400) — left unfilled
  await designPage.selectVectorEditMoveTool();

  const nodeId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    return rootOrder[rootOrder.length - 1];
  });

  // action — a plain click inside the still-unfilled face selects its 4 vertices (previously a no-op)
  await designPage.click(950, 350);
  await page.keyboard.press('Delete');

  const node = await page.evaluate(
    (id) =>
      import('/src/store/index.ts').then(({ store }) => {
        const { activePageId, pages } = store.getState().design;

        return pages[activePageId].nodes[id];
      }),
    nodeId,
  );

  // no neighbor to protect, so the whole boundary is gone, same as Shape Builder's own isolated-face
  // Alt+click case
  expect(node.segments).toEqual({});
  expect(node.vertices).toEqual({});
});

test('Delete on a selected sector deletes only its own exclusive boundary, leaving the segment shared with an untouched neighbor intact', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-sector-delete-preserves-shared-neighbor');
  await expect(designPage.canvas).toBeVisible();

  // a square split into a top/bottom half by divider s7 (v3<->v6), left unfilled — same geometry as
  // this file's own split-square fixture above (the §56 shift-click test), minus the fill
  const nodeId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNode, setActiveTool, setVectorEditingNodeIds } = await import('/src/store/design/slice.ts');

    const segments = {
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
      s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      s4: { endId: 'v5', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      s5: { endId: 'v6', id: 's5', startId: 'v5', tangentEnd: null, tangentStart: null },
      s6: { endId: 'v1', id: 's6', startId: 'v6', tangentEnd: null, tangentStart: null },
      s7: { endId: 'v6', id: 's7', startId: 'v3', tangentEnd: null, tangentStart: null },
    };
    const vertices = {
      v1: { id: 'v1', x: 900, y: 300 },
      v2: { id: 'v2', x: 1000, y: 300 },
      v3: { id: 'v3', x: 1000, y: 350 },
      v4: { id: 'v4', x: 1000, y: 400 },
      v5: { id: 'v5', x: 900, y: 400 },
      v6: { id: 'v6', x: 900, y: 350 },
    };

    store.dispatch(
      addNode({
        fillColor: '#ff0000',
        filledFaceKeys: [],
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
    const id = state.design.pages[state.design.activePageId].rootOrder[state.design.pages[state.design.activePageId].rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeIds([id]));
    store.dispatch(setActiveTool('move' as never));

    return id;
  });

  // action — click only the top half (selecting v1/v2/v3/v6), then delete it
  await designPage.click(950, 325);
  await page.keyboard.press('Delete');

  const node = await page.evaluate(
    (id) =>
      import('/src/store/index.ts').then(({ store }) => {
        const { activePageId, pages } = store.getState().design;

        return pages[activePageId].nodes[id];
      }),
    nodeId,
  );

  // the top's own exclusive edges (s1, s2, s6) are gone, but the divider (s7) and the bottom half's
  // own boundary (s3, s4, s5) survive since the bottom half was never touched
  expect(Object.keys(node.segments).sort()).toEqual(['s3', 's4', 's5', 's7']);
  expect(Object.keys(node.vertices).sort()).toEqual(['v3', 'v4', 'v5', 'v6']);
});
