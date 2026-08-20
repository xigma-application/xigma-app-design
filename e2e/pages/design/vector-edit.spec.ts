import { Page, test, expect } from '@playwright/test';

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

// switches to the Move tool and presses Escape twice, which — per the Pen tool's staged Escape
// behavior — fully exits vector edit mode for a path that was drawn entirely with plain clicks
// (1st: clears the still-active last vertex, 2nd: since the tool is already Move, exits editing).
const exitVectorEditMode = async (page: Page, designPage: DesignPage): Promise<void> => {
  await designPage.selectTool('default');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
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
  await exitVectorEditMode(page, designPage);

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

test('dragging a vertex dot moves that vertex', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-drag-vertex');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectTool('default'); // still in edit mode, left over from drawing

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
  await designPage.selectTool('default');

  const before = await designPage.canvas.screenshot();

  await designPage.dragVectorPoint(1050, 350, 1100, 400); // grab and move that handle

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('dragging one handle at a "smooth" vertex also moves its other handle, curving both segments', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-smooth-mirror');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // v1
  await designPage.dragVectorPoint(1050, 300, 1050, 250); // v2, dragged — stages an outgoing tangent
  await designPage.click(1200, 300); // v3, plain click — segment 2 inherits the staged tangent
  await designPage.selectTool('default');

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

test('clicking an edge with the Move tool selects the segment instead of splitting it — that still requires the Pen tool, matching Figma', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-edge-move-tool-select');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectTool('default');

  await designPage.click(975, 300); // midpoint of the v1-v2 edge
  const moveToolSelect = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-vector-edit-edge-move-tool-select-reference');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectTool('pen');
  await designPage.click(975, 300); // Pen tool, same point: splits the edge and arms the new vertex
  const penToolSplit = await designPage.canvas.screenshot();

  // the Move tool's plain segment-selection highlight looks nothing like the Pen tool's inserted vertex
  expect(moveToolSelect.equals(penToolSplit)).toBe(false);
});

test('clicking a segment with the Move tool selects it, and Delete removes just that segment, leaving both endpoint vertices and the other segment in place', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-segment-select-delete');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectTool('default');

  await designPage.click(975, 300); // midpoint of the v1-v2 edge — selects that segment
  const selected = await designPage.canvas.screenshot();

  await page.keyboard.press('Delete');
  const afterDelete = await designPage.canvas.screenshot();

  expect(afterDelete.equals(selected)).toBe(false); // the v1-v2 edge is gone

  // the other segment (v2-v3) survives untouched — still there to select
  await designPage.click(1050, 375); // midpoint of the v2-v3 edge
  const remainingSelected = await designPage.canvas.screenshot();

  expect(remainingSelected.equals(afterDelete)).toBe(false);
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
  await designPage.selectTool('default');

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
  await designPage.selectTool('default');
  await designPage.drawFrame(1300, 300, 1400, 400); // node B, auto-selected on creation
  await designPage.click(1350, 350); // reaffirm B is the current selection

  const viaSelectingB = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-vector-edit-different-node-reference');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage);
  await designPage.selectTool('default');
  await page.keyboard.press('Escape'); // exit edit mode for A explicitly first
  await page.keyboard.press('Escape');
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
  await exitVectorEditMode(page, designPage);

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
  await exitVectorEditMode(page, designPage);

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
  await exitVectorEditMode(page, designPage);

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
  await designPage.selectTool('default');

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
  await designPage.selectTool('default');

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
  await designPage.selectTool('default');

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

test('dragging a marquee over empty space selects every vertex whose point falls inside it, leaving points outside untouched', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-marquee-select');
  await expect(designPage.canvas).toBeVisible();

  await drawOpenTriangle(designPage); // v1(900,300), v2(1050,300), v3(1050,450)
  await designPage.selectTool('default');

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
