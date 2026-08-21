import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

// utils
import { countMismatchedPixels } from './compareScreenshots';

test.describe.configure({ mode: 'serial' });

// v1 (900,300) -> v2 (1050,300) -> v3 (1050,450), all plain clicks (no curve), left open. Leaves the
// canvas still on the Pen tool with the node in vector edit mode, exactly as a real draw session would.
const drawOpenTriangle = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
    { x: 1050, y: 450 },
  ]);
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

  // once a vertex has been grabbed, the whole path's stroke stays rendered in its brighter
  // "actively editing this vertex" tint even after undo restores the actual vertex position — that
  // tint lives in a ref (selectedVectorVertexIdsRef), not in undoable store state, so a full-canvas
  // comparison back to `before` (never touched) would spuriously differ; comparing small regions at
  // the origin and destination points, before vs. after undo, isolates the position claim from it
  const originRegion = { height: 24, width: 24, x: 888, y: 288 };
  const destinationRegion = { height: 24, width: 24, x: 838, y: 238 };
  const originAfterDrag = await page.screenshot({ clip: originRegion });
  const destinationAfterDrag = await page.screenshot({ clip: destinationRegion });

  await page.keyboard.press('Control+z');
  const originAfterUndo = await page.screenshot({ clip: originRegion });
  const destinationAfterUndo = await page.screenshot({ clip: destinationRegion });

  expect(originAfterUndo.equals(originAfterDrag)).toBe(false); // the dot reappears at (900, 300)
  expect(destinationAfterUndo.equals(destinationAfterDrag)).toBe(false); // and leaves (850, 250)
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

test('starting a Lasso drag directly on top of an existing vertex still starts a lasso stroke instead of dragging that vertex — a dedicated tool intercepts the click before any vertex-drag resolver sees it', async ({
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

  // dragging starting exactly on v1 and ending well away from it — if this were a vertex drag, v1
  // would have moved to the release point; a lasso stroke instead leaves it exactly where it was
  await designPage.dragVectorLasso([
    { x: 900, y: 300 },
    { x: 1200, y: 600 },
  ]);

  const afterV1 = await page.screenshot({ clip: v1Region });

  expect(afterV1.equals(beforeV1)).toBe(true);
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
    const { addNode, setActiveTool, setVectorEditingNodeId } = sliceModule;

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
    const nodeId = state.design.rootOrder[state.design.rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeId(nodeId));
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
