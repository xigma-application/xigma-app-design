import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test.describe.configure({ mode: 'serial' });

test('clicking places vertices and extends an open path with straight segments on every click', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-draw-open-path');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');

  await designPage.click(700, 300); // v1 — a lone vertex, already in vector edit mode
  const afterFirstVertex = await designPage.canvas.screenshot();

  await designPage.click(850, 300); // v2 — extends with a straight segment
  const afterSecondVertex = await designPage.canvas.screenshot();

  expect(afterSecondVertex.equals(afterFirstVertex)).toBe(false);

  await designPage.click(850, 450); // v3 — extends further
  const afterThirdVertex = await designPage.canvas.screenshot();

  expect(afterThirdVertex.equals(afterSecondVertex)).toBe(false);
});

test('click-dragging while placing a vertex curves the new segment via a tangent handle', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-curved-vertex');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.dragVectorPoint(850, 300, 850, 250); // v2, dragged out — curves segment 1
  await designPage.pointerMove(1500, 900); // rest away, without placing another vertex
  const curved = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-straight-vertex-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2, plain click — straight segment
  await designPage.pointerMove(1500, 900);
  const straight = await designPage.canvas.screenshot();

  expect(curved.equals(straight)).toBe(false);
});

test('a drag shorter than the minimum drag distance is still treated as a plain (straight) click', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-sub-threshold-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.dragVectorPoint(850, 300, 851, 300); // 1px drag, under MIN_DRAG_DISTANCE_PX (2)
  await designPage.pointerMove(1500, 900);
  const subThreshold = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-sub-threshold-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300); // plain click at the same spot
  await designPage.pointerMove(1500, 900);
  const plainClick = await designPage.canvas.screenshot();

  expect(subThreshold.equals(plainClick)).toBe(true);
});

test('the pen preview line follows the pointer, and a snap indicator appears near the start vertex', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-preview-and-snap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1, now the active vertex

  await designPage.pointerMove(1200, 500); // far away
  const previewFar = await designPage.canvas.screenshot();

  await designPage.pointerMove(750, 320); // near v1, but not close enough to snap
  const previewNear = await designPage.canvas.screenshot();

  expect(previewNear.equals(previewFar)).toBe(false); // the rubber-band line's endpoint moved

  await designPage.click(850, 300); // v2
  await designPage.click(850, 450); // v3, now far from the start vertex

  await designPage.pointerMove(1200, 500); // far baseline, no snap
  const noSnap = await designPage.canvas.screenshot();

  await designPage.pointerMove(700, 300); // exactly on the start vertex — within snap radius
  const snapping = await designPage.canvas.screenshot();

  expect(snapping.equals(noSnap)).toBe(false);
});

test('clicking back onto the start vertex closes the loop with a straight closing segment', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-close-loop-straight');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 850, y: 300 },
    { x: 850, y: 450 },
  ]);
  const beforeClose = await designPage.canvas.screenshot();

  await designPage.click(700, 300); // back onto v1 — closes the loop
  const afterClose = await designPage.canvas.screenshot();

  expect(afterClose.equals(beforeClose)).toBe(false);
});

test('dragging the vertex before closing stages a curve that also bends the closing segment', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-close-loop-curved');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2
  await designPage.dragVectorPoint(850, 450, 900, 500); // v3, dragged out — stages an outgoing tangent
  await designPage.click(700, 300); // close — the closing segment inherits that staged tangent
  const curvedClose = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-close-loop-curved-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 850, y: 300 },
    { x: 850, y: 450 }, // plain click — no staged tangent
    { x: 700, y: 300 }, // close
  ]);
  const straightClose = await designPage.canvas.screenshot();

  expect(curvedClose.equals(straightClose)).toBe(false);
});

test('a closed loop renders a different, connected outline than the same vertices left open', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-closed-vs-open');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 850, y: 300 },
    { x: 850, y: 450 },
    { x: 700, y: 300 }, // close
  ]);
  const closed = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-closed-vs-open-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 850, y: 300 },
    { x: 850, y: 450 }, // left open — no closing click
  ]);
  const open = await designPage.canvas.screenshot();

  expect(closed.equals(open)).toBe(false);
});

test('Escape steps through stopping the active vertex, then the tool, then vector edit mode itself', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-escape-stages');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2 — now the active vertex, preview line live

  await designPage.pointerMove(1200, 500);
  const beforeEscapeFar = await designPage.canvas.screenshot();

  await designPage.pointerMove(750, 320);
  const beforeEscapeNear = await designPage.canvas.screenshot();

  expect(beforeEscapeNear.equals(beforeEscapeFar)).toBe(false); // preview line present

  await page.keyboard.press('Escape'); // 1st — stops extending, stays on Pen, stays in edit mode

  await expect(designPage.toolRadio('pen')).toHaveAttribute('aria-checked', 'true');

  await designPage.pointerMove(1200, 500);
  const afterEscape1Far = await designPage.canvas.screenshot();

  await designPage.pointerMove(750, 320);
  const afterEscape1Near = await designPage.canvas.screenshot();

  // the rubber-band line is gone, but the floating next-point dot now tracks the cursor again (with
  // vertex-snap attraction) instead of staying hidden — see handlePointerMove.ts's node-but-no-active-
  // vertex branch — so near vs. far still differ, just via that dot instead of the old preview line
  expect(afterEscape1Near.equals(afterEscape1Far)).toBe(false);

  await page.keyboard.press('Escape'); // 2nd — reverts the tool to default, keeps edit mode

  await expect(designPage.toolRadio('default')).toHaveAttribute('aria-checked', 'true');
  await expect(designPage.toolRadio('pen')).toHaveAttribute('aria-checked', 'false');

  const stillEditing = await designPage.canvas.screenshot(); // v1/v2 dots still rendered

  await page.keyboard.press('Escape'); // 3rd — exits vector edit mode entirely

  const exited = await designPage.canvas.screenshot();

  expect(exited.equals(stillEditing)).toBe(false); // the dots disappeared
});

test('resuming a vertex after Escape interrupts a curve does not silently reuse the old drag as the next segment’s tangent', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const previewRegion = { height: 60, width: 200, x: 780, y: 270 };

  // mock — v1 plain, v2 dragged into a curve, Escape (stops extending), then click straight back onto v2 and
  // hover the same far point: without the fix, v2 still carries the earlier drag's pendingOutgoingTangentRef,
  // so this preview line renders curved even though nothing was dragged this time
  await designPage.goto('e2e-test-pen-escape-resume-stale-tangent');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.dragVectorPoint(850, 300, 850, 250); // v2, dragged — stages an outgoing tangent
  await page.keyboard.press('Escape'); // stops extending, v2 no longer active
  await designPage.click(850, 300); // resume from v2 via a plain click, no drag
  await designPage.pointerMove(950, 300);

  const resumedPreview = await page.screenshot({ clip: previewRegion });

  // mock — an independent session where v2 is placed fresh with a plain click, never dragged at all, then
  // hovering the exact same far point: this is the known-straight reference the resumed preview must match
  await designPage.goto('e2e-test-pen-escape-resume-stale-tangent-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(850, 300); // v2, placed directly, no earlier curve/drag/Escape at all
  await designPage.pointerMove(950, 300);

  const freshPreview = await page.screenshot({ clip: previewRegion });

  expect(resumedPreview.equals(freshPreview)).toBe(true);
});

test('switching tools mid-draw leaves the node directly editable via the Move tool', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-switch-tool-mid-draw');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2, active vertex

  await designPage.selectTool('default'); // leave Pen without Escape
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.dragVectorPoint(700, 300, 650, 250); // grab v1 directly, via the Move tool
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false);
});

test('switching back to Pen after leaving mid-draw resumes from the stale active vertex', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-resume-stale-vertex');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2, active vertex
  await designPage.selectTool('default'); // leave without Escape — penActiveVertexId stays v2
  await designPage.selectTool('pen'); // back to Pen
  await designPage.click(850, 450); // v3 — resumes extending from v2, connecting them
  const resumed = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-resume-stale-vertex-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300);
  await page.keyboard.press('Escape'); // explicitly clears the active vertex first
  await designPage.click(850, 450); // starts a disconnected fragment instead
  const fragment = await designPage.canvas.screenshot();

  expect(resumed.equals(fragment)).toBe(false);
});

test('after finishing a fragment, clicking elsewhere still adds to the same vector node, not a new one', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-shared-node-fragments');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 850, y: 300 },
    { x: 850, y: 450 },
    { x: 700, y: 300 }, // close loop A
  ]);

  await designPage.click(1100, 300); // starts a second, disconnected fragment B on the same node
  await designPage.click(1250, 300); // extends fragment B

  await designPage.selectTool('default');
  await designPage.doubleClick(1400, 700); // empty space — exits vector edit mode

  await designPage.click(775, 300); // midpoint of loop A's top edge
  const selectedViaA = await designPage.canvas.screenshot();

  await designPage.click(1500, 900); // deselect
  await designPage.click(1175, 300); // midpoint of fragment B's segment
  const selectedViaB = await designPage.canvas.screenshot();

  // both clicks select the exact same shared-node outline, proving A and B are one node
  expect(selectedViaA.equals(selectedViaB)).toBe(true);
});

test('Pen sits between Rectangle and Text in the toolbar', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-toolbar-position');
  await expect(designPage.canvas).toBeVisible();

  const rectangleBox = await designPage.toolRadio('rectangle').boundingBox();
  const penBox = await designPage.toolRadio('pen').boundingBox();
  const textBox = await designPage.toolRadio('text').boundingBox();

  if (!rectangleBox || !penBox || !textBox) {
    throw new Error('toolbar buttons not found');
  }

  expect(rectangleBox.x).toBeLessThan(penBox.x);
  expect(penBox.x).toBeLessThan(textBox.x);
});

test('Pencil lives only in the Pen dropdown, and the shared button remembers it as last-used', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-pencil-dropdown');
  await expect(designPage.canvas).toBeVisible();

  await expect(designPage.toolRadio('pencil')).not.toBeAttached(); // not a top-level icon yet

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  await expect(designPage.toolRadio('pencil')).toHaveAttribute('aria-checked', 'true');

  await designPage.selectTool('default'); // switch away
  await expect(designPage.toolRadio('pencil')).toHaveAttribute('aria-checked', 'false');

  await designPage.toolRadio('pencil').click(); // the shared button itself now shows Pencil directly
  await expect(designPage.toolRadio('pencil')).toHaveAttribute('aria-checked', 'true');
});

test('Pen and Pencil apply distinct cursor classNames while active', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-pencil-cursor');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  const penClassName = await designPage.cursorClassName();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  const pencilClassName = await designPage.cursorClassName();

  expect(penClassName).toContain('pen');
  expect(pencilClassName).toContain('pencil');
  expect(penClassName).not.toBe(pencilClassName);
});

test('the Pencil tool does not draw anything on the canvas yet', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pencil-no-op');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  // captured only after Pencil is already active, so the toolbar's own highlighted-icon change
  // (default -> pen group) isn't mistaken for something the tool drew on the canvas
  const before = await designPage.canvas.screenshot();

  await designPage.click(700, 300);
  await designPage.dragVectorPoint(850, 300, 950, 450);
  await designPage.pointerMove(1500, 900);

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(true);
});

test('the Pen tool stays active after finishing a network, unlike shape tools reverting to default', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-stays-active');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 850, y: 300 },
    { x: 850, y: 450 },
    { x: 700, y: 300 }, // close loop
  ]);

  await expect(designPage.toolRadio('pen')).toHaveAttribute('aria-checked', 'true');
});

test('undo steps back through vertex placements one click at a time', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-undo');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  const afterV1 = await designPage.canvas.screenshot();

  await designPage.click(850, 300);
  const afterV2 = await designPage.canvas.screenshot();

  await designPage.click(850, 450);
  const afterV3 = await designPage.canvas.screenshot();

  expect(afterV2.equals(afterV1)).toBe(false);
  expect(afterV3.equals(afterV2)).toBe(false);

  // Escape (1st stage) clears the active vertex before undoing anything — undo/redo only ever
  // restores nodes/rootOrder/selectedIds, never the transient penActiveVertexId, so undoing while
  // still "mid-draw" would leave that ref dangling at a now-deleted vertex id and its own live
  // preview line would render (or not) unpredictably; clearing it first keeps every capture below
  // free of that noise
  await page.keyboard.press('Escape');
  await designPage.pointerMove(1500, 900);

  const state3 = await designPage.canvas.screenshot();

  await page.keyboard.press('Control+z');
  await designPage.pointerMove(1500, 900);
  const state2 = await designPage.canvas.screenshot();

  expect(state2.equals(state3)).toBe(false);

  await page.keyboard.press('Control+z');
  await designPage.pointerMove(1500, 900);
  const state1 = await designPage.canvas.screenshot();

  expect(state1.equals(state2)).toBe(false);

  // independent references: the same "place N vertices, then Escape, then rest at a neutral point"
  // sequence, stopped one (and two) clicks earlier — undoing should land on pixel-identical results
  await designPage.goto('e2e-test-pen-undo-reference-two-vertices');
  await expect(designPage.canvas).toBeVisible();
  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300);
  await page.keyboard.press('Escape');
  await designPage.pointerMove(1500, 900);
  const referenceTwoVertices = await designPage.canvas.screenshot();

  expect(state2.equals(referenceTwoVertices)).toBe(true);

  // state1 (v1 alone, no segments, node not deleted) can no longer be reached by "draw v1, then
  // Escape" — v1 would be the node's only, still-unconnected vertex, and Escape now deletes exactly
  // that dangling case outright (see deleteDanglingActiveVertex.ts). Reach the same end state a
  // different way instead: draw v1 and v2 (a real segment now exists), Escape (only stops extending,
  // since v2 is connected), then delete v2 via the ordinary vertex-selection Delete key — that path
  // never cascades into whole-node deletion, leaving v1 alone exactly like the undo-derived state1
  await designPage.goto('e2e-test-pen-undo-reference-one-vertex');
  await expect(designPage.canvas).toBeVisible();
  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300);
  await page.keyboard.press('Escape');
  await designPage.selectTool('default');
  await designPage.click(850, 300); // select v2's dot
  await page.keyboard.press('Backspace');
  await designPage.selectTool('pen'); // back to Pen — state1 stayed on Pen the whole time via undo
  await designPage.pointerMove(1500, 900);
  const referenceOneVertex = await designPage.canvas.screenshot();

  expect(state1.equals(referenceOneVertex)).toBe(true);
});

test('click-dragging directly on the active vertex — not while placing it — shapes the tangent for the next segment', async ({ page }) => {
  const designPage = new DesignPage(page);

  // mock — v2 is placed with a plain click first (straight, no tangent), and only *afterwards*, as a
  // fully separate press-drag-release gesture, do we grab v2 again at its own committed position;
  // this is distinct from the already-covered "click-drag while placing a vertex" case above, where
  // the drag is part of the very same gesture that creates the vertex
  await designPage.goto('e2e-test-pen-drag-active-vertex-tangent');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2, plain click — now the active vertex, no tangent yet
  await designPage.dragVectorPoint(850, 300, 900, 250); // separate gesture: press-drag directly on v2 itself
  await designPage.click(850, 450); // v3 — the new segment inherits the tangent just staged on v2
  await designPage.pointerMove(1500, 900);
  const curved = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-drag-active-vertex-tangent-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 850, y: 300 },
    { x: 850, y: 450 }, // plain clicks only — straight segments throughout, no drag on v2 at all
  ]);
  await designPage.pointerMove(1500, 900);
  const straight = await designPage.canvas.screenshot();

  expect(curved.equals(straight)).toBe(false);
});

test('click-dragging directly on a resumed (non-active) vertex shapes its outgoing tangent', async ({ page }) => {
  const designPage = new DesignPage(page);

  // mock — v2 is placed, Escape stops extending (v2 no longer active, per Escape's 1st stage), then
  // v2 is resumed by pressing directly on its own position with no active vertex at all — exercises
  // startVectorFragment.ts's hover branch, distinct from the active-vertex case above
  await designPage.goto('e2e-test-pen-drag-resumed-vertex-tangent');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2
  await page.keyboard.press('Escape'); // stops extending — v2 no longer the active vertex
  await designPage.dragVectorPoint(850, 300, 900, 250); // resume v2 by pressing directly on it, then drag
  await designPage.click(850, 450); // v3 — inherits the tangent staged on the resumed v2
  await designPage.pointerMove(1500, 900);
  const curved = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-drag-resumed-vertex-tangent-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300);
  await page.keyboard.press('Escape');
  await designPage.click(850, 300); // resume with a plain click, no drag
  await designPage.click(850, 450);
  await designPage.pointerMove(1500, 900);
  const straight = await designPage.canvas.screenshot();

  expect(curved.equals(straight)).toBe(false);
});

test('click-dragging onto an existing vertex to close the loop shapes the closing segment’s tangent, instead of only ever closing it straight', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-drag-close-loop-tangent');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2
  await designPage.dragVectorPoint(700, 450, 650, 500); // v3, dragged out
  await designPage.dragVectorPoint(700, 300, 650, 250); // close back onto v1 — a drag, not a plain click
  const curvedClose = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-drag-close-loop-tangent-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300);
  await designPage.dragVectorPoint(700, 450, 650, 500);
  await designPage.click(700, 300); // close with a plain click — no tangent on the closing segment
  const straightClose = await designPage.canvas.screenshot();

  expect(curvedClose.equals(straightClose)).toBe(false);
});

test('a click-drag close reveals both the closing segment’s own tangent and the live-dragged handle, unlike a plain closing click', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 120, width: 220, x: 630, y: 220 };

  await designPage.goto('e2e-test-pen-close-drag-handles');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2
  await designPage.click(850, 450); // v3, now the active vertex
  await designPage.pointerDown(700, 300); // press directly on v1 to start closing
  await designPage.pointerMove(650, 250); // drag out — shapes the closing segment's tangentEnd live
  const midDrag = await page.screenshot({ clip: region });

  await designPage.pointerUp();

  await designPage.goto('e2e-test-pen-close-drag-handles-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300);
  await designPage.click(850, 450);
  await designPage.click(700, 300); // plain close, no drag — no tangent handles to reveal
  await designPage.pointerMove(650, 250); // rest at the same spot the drag test ended up at
  const noDrag = await page.screenshot({ clip: region });

  expect(midDrag.equals(noDrag)).toBe(false);
});
