import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

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

  await page.keyboard.press('Escape'); // 2nd — reverts the tool to Move (ToolName.move), keeps edit mode

  // ToolName.move is distinct from the main toolbar's default/hand/scale group (see
  // vector-network.md §41/§45) — it only ever shows as pressed on VectorEditToolbar's own Move
  // button, never as a checked radio on the main toolbar
  await expect(page.getByRole('button', { exact: true, name: 'Move' })).toHaveAttribute('aria-pressed', 'true');
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
  // clipped to start just past v2's own dot (850,300) — the "resumed" scenario's v1 also curves into v2
  // from below (the drag target was above v2, so its mirrored tangentEnd approaches from y > 300), and
  // that curve tail's antialiasing reaches into the clip if it starts at/before v2's own x — the "fresh"
  // reference has no v1 at all, so a clip wide enough to catch that tail would never match pixel-for-pixel
  // regardless of the fix under test; starting past the dot keeps the comparison to just the preview line
  // itself, which is what this test actually cares about
  const previewRegion = { height: 60, width: 115, x: 860, y: 270 };

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

  // clipped to the canvas's own safe area, excluding the LeftPanel: canvas.screenshot() composites
  // that overlaying panel in too, and its layers-row icon can repaint on a slightly different frame
  // between these two click sequences (deselect-then-select vs a direct click) — a UI-timing detail
  // of the panel, unrelated to what this test actually checks (the canvas selection outline itself)
  const canvasArea = await designPage.canvasSafeArea();

  await designPage.click(775, 300); // midpoint of loop A's top edge
  const selectedViaA = await page.screenshot({ clip: canvasArea });

  await designPage.click(1500, 900); // deselect
  await designPage.click(1175, 300); // midpoint of fragment B's segment
  const selectedViaB = await page.screenshot({ clip: canvasArea });

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

  // clipped to the canvas's own safe area, excluding the LeftPanel: canvas.screenshot() composites
  // that overlaying panel in too, and its layers-row icon can repaint on a slightly different frame
  // depending on timing unrelated to what this test actually checks (the canvas drawing itself)
  const canvasArea = await designPage.canvasSafeArea();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  const afterV1 = await page.screenshot({ clip: canvasArea });

  await designPage.click(850, 300);
  const afterV2 = await page.screenshot({ clip: canvasArea });

  await designPage.click(850, 450);
  const afterV3 = await page.screenshot({ clip: canvasArea });

  expect(afterV2.equals(afterV1)).toBe(false);
  expect(afterV3.equals(afterV2)).toBe(false);

  // Escape (1st stage) clears the active vertex before undoing anything — undo/redo only ever
  // restores nodes/rootOrder/selectedIds, never the transient penActiveVertexId, so undoing while
  // still "mid-draw" would leave that ref dangling at a now-deleted vertex id and its own live
  // preview line would render (or not) unpredictably; clearing it first keeps every capture below
  // free of that noise
  await page.keyboard.press('Escape');
  await designPage.pointerMove(1500, 900);

  const state3 = await page.screenshot({ clip: canvasArea });

  await page.keyboard.press('Control+z');
  await designPage.pointerMove(1500, 900);
  const state2 = await page.screenshot({ clip: canvasArea });

  expect(state2.equals(state3)).toBe(false);

  await page.keyboard.press('Control+z');
  await designPage.pointerMove(1500, 900);
  const state1 = await page.screenshot({ clip: canvasArea });

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
  const referenceTwoVertices = await page.screenshot({ clip: canvasArea });

  expect(state2.equals(referenceTwoVertices)).toBe(true);

  // state1 (v1 alone, no segments, node not deleted) can no longer be reached by "draw v1, then
  // Escape" — v1 would be the node's only, still-unconnected vertex, and Escape now deletes exactly
  // that dangling case outright (see deleteDanglingActiveVertex.ts). It also can no longer be reached
  // by drawing v1+v2 and deleting v2 via the Delete key — handleDeleteSelection.ts's vertex-deletion
  // branch now prunes *any* vertex left with zero remaining segments (not just the one directly
  // selected, fixing a separate orphaned-dot bug), so deleting v2 orphans v1 too and both vanish
  // together. Reach the same end state via undo instead, from an independent, shorter session: v1+v2
  // is the exact same single gesture-pair state1's own second undo already restores (the pre-gesture
  // snapshot captured just before v2 was placed doesn't depend on whether a v3 was ever drawn
  // afterwards), so undoing it once here must land on the identical result
  await designPage.goto('e2e-test-pen-undo-reference-one-vertex');
  await expect(designPage.canvas).toBeVisible();
  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+z'); // undoes the v2 placement, leaving v1 alone
  await designPage.pointerMove(1500, 900);
  const referenceOneVertex = await page.screenshot({ clip: canvasArea });

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

test('a plain (no-Ctrl) drag directly on the active vertex renders differently than a Ctrl/Cmd+drag on the same gesture — only Ctrl bends the already-committed incoming segment', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  // mock — v1-v2 is committed as a plain straight segment first; a fresh press-drag-release gesture
  // directly on v2 (the active vertex) stages v2's own pending outgoing tangent either way (rendered
  // identically in both cases, per §18's persistent preview diamond — not what this test is isolating),
  // but must additionally bend the already-committed v1-v2 segment only when Ctrl/Cmd is held, matching
  // the Ctrl-gated mirroring §9/§30 already use for reshaping an existing segment elsewhere in this
  // feature; comparing the two renders directly (rather than against an all-straight reference) is what
  // isolates that one difference from the shared pending-tangent preview both cases render identically
  await designPage.goto('e2e-test-pen-drag-active-vertex-no-ctrl');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2, plain click — straight v1-v2, v2 is now the active vertex
  await designPage.dragVectorPoint(850, 300, 900, 250); // plain drag directly on v2, no Ctrl held
  await designPage.pointerMove(1500, 900);
  const noCtrlResult = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-drag-active-vertex-ctrl');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 300); // v2, plain click — straight v1-v2, v2 is now the active vertex
  await designPage.ctrlDragVectorPoint(850, 300, 900, 250); // Ctrl+drag directly on v2 — mirrors into v1-v2
  await designPage.pointerMove(1500, 900);
  const ctrlResult = await designPage.canvas.screenshot();

  expect(noCtrlResult.equals(ctrlResult)).toBe(false);
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

test('hovering within the angle-snap tolerance of horizontal pulls the rubber-band preview onto the exact axis', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-angle-snap-preview');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.pointerMove(850, 304); // a couple of px off horizontal — within the angle-snap tolerance
  const nearHorizontal = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-angle-snap-preview-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.pointerMove(850, 300); // exactly horizontal — the position the snap should pull onto
  const exactHorizontal = await designPage.canvas.screenshot();

  // the near-horizontal hover snaps onto the same axis, rendering pixel-identical to hovering exactly on it
  expect(nearHorizontal.equals(exactHorizontal)).toBe(true);
});

test('a diagonal hover, well outside the angle-snap tolerance, keeps the default blue preview instead of the orange snap color', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-angle-snap-diagonal');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.pointerMove(850, 450); // 45deg — well outside the snap tolerance
  const diagonal = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-angle-snap-diagonal-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.pointerMove(850, 300); // horizontal, at the same x — snapped, orange
  const horizontal = await designPage.canvas.screenshot();

  expect(diagonal.equals(horizontal)).toBe(false);
});

test('clicking within the angle-snap tolerance commits the new vertex exactly onto the cardinal axis, not the raw cursor position', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-angle-snap-commit');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 304); // v2 — a couple of px off horizontal, within the angle-snap tolerance
  await designPage.pointerMove(1500, 900); // rest away
  const snappedCommit = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-angle-snap-commit-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 300); // exactly horizontal — where the snap should have landed
  await designPage.pointerMove(1500, 900);
  const exactCommit = await designPage.canvas.screenshot();

  expect(snappedCommit.equals(exactCommit)).toBe(true);
});

test('click-dragging a tangent handle while placing a vertex, within the angle-snap tolerance of horizontal, snaps it onto the exact axis and colors it orange', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 100, width: 220, x: 780, y: 250 };

  // mock — v1 plain, v2 placed with a click-drag whose direction is a couple of px off horizontal
  // (within the angle-snap tolerance) — the tangent handle itself should snap onto the exact axis
  await designPage.goto('e2e-test-pen-tangent-angle-snap-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.dragVectorPoint(850, 300, 950, 303); // v2, dragged — near-horizontal tangent
  const snappedDrag = await page.screenshot({ clip: region });

  // mock — the same gesture, but dragged exactly horizontal — the position the snap should land on
  await designPage.goto('e2e-test-pen-tangent-angle-snap-drag-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.dragVectorPoint(850, 300, 950, 300); // exactly horizontal
  const exactDrag = await page.screenshot({ clip: region });

  expect(snappedDrag.equals(exactDrag)).toBe(true);
});

test('click-dragging a tangent handle well outside the angle-snap tolerance keeps the default blue instead of the orange snap color', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 100, width: 220, x: 780, y: 250 };

  await designPage.goto('e2e-test-pen-tangent-angle-snap-diagonal');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.dragVectorPoint(850, 300, 950, 350); // 45deg — well outside the snap tolerance
  const diagonalDrag = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-pen-tangent-angle-snap-diagonal-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.dragVectorPoint(850, 300, 950, 300); // exactly horizontal — snapped, orange
  const horizontalDrag = await page.screenshot({ clip: region });

  expect(diagonalDrag.equals(horizontalDrag)).toBe(false);
});

test('Shift held while clicking a diagonal point hard-constrains the new vertex to the nearest 15deg increment, even at an angle the plain snap ignores', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  // mock — a diagonal click well outside the plain (no-Shift) snap's 4-cardinal-only reach
  await designPage.goto('e2e-test-pen-shift-angle-snap-commit');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.click(850, 386, { shift: true }); // Shift held — hard-constrained to a 15deg increment
  await designPage.pointerMove(1500, 900);
  const shiftClick = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-shift-angle-snap-commit-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.click(850, 386); // the exact same click, no Shift — commits at the raw diagonal point
  await designPage.pointerMove(1500, 900);
  const plainClick = await designPage.canvas.screenshot();

  expect(shiftClick.equals(plainClick)).toBe(false);
});

test('Shift held while dragging a tangent handle while placing a vertex hard-constrains it to the nearest 15deg increment', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 120, width: 220, x: 780, y: 250 };

  await designPage.goto('e2e-test-pen-shift-tangent-angle-snap-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.shiftDragVectorPoint(850, 300, 950, 350); // Shift held — 45deg, well off any cardinal
  const shiftDrag = await page.screenshot({ clip: region });

  await designPage.goto('e2e-test-pen-shift-tangent-angle-snap-drag-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300);
  await designPage.dragVectorPoint(850, 300, 950, 350); // identical drag, no Shift
  const plainDrag = await page.screenshot({ clip: region });

  expect(shiftDrag.equals(plainDrag)).toBe(false);
});

test('pressing Shift immediately re-evaluates the rubber-band preview, without needing the pointer to move again', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pen-shift-immediate-preview-snap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.pointerMove(850, 386); // diagonal hover, well outside the plain snap's reach
  const beforeShift = await designPage.canvas.screenshot();

  // action — hold Shift down with no further pointer movement at all
  await page.keyboard.down('Shift');
  const afterShift = await designPage.canvas.screenshot();
  await page.keyboard.up('Shift');

  // result — the preview already changed just from the key press
  expect(afterShift.equals(beforeShift)).toBe(false);
});

test('pressing Shift immediately re-evaluates an in-progress tangent-handle drag, without needing the pointer to move again', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const region = { height: 120, width: 220, x: 780, y: 250 };

  await designPage.goto('e2e-test-pen-shift-immediate-drag-snap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('pen');
  await designPage.click(700, 300); // v1
  await designPage.pointerDown(850, 300); // press on v2's spot — places it and arms the tangent drag
  await designPage.pointerMove(950, 350); // drag out diagonally, past the minimum drag threshold
  const beforeShift = await page.screenshot({ clip: region });

  // action — hold Shift down with no further pointer movement
  await page.keyboard.down('Shift');
  const afterShift = await page.screenshot({ clip: region });
  await page.keyboard.up('Shift');
  await designPage.pointerUp();

  // result — the live tangent handle already snapped just from the key press
  expect(afterShift.equals(beforeShift)).toBe(false);
});

test('placing a new vertex near a vertex on a completely separate shape snaps it onto that alignment guide, pixel-identical to placing it exactly there', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  // mock — shape A is an unrelated short vertical line at x=700 (the alignment candidate); shape B is
  // drawn separately, its second vertex placed a couple of px off shape A's x=700 column
  await designPage.goto('e2e-test-pen-alignment-guide-commit');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 700, y: 500 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await designPage.selectTool('pen');
  await designPage.click(900, 300); // shape B's v1
  await designPage.click(703, 600); // shape B's v2 — a couple of px off shape A's x=700 column
  await designPage.pointerMove(1500, 900); // rest away
  const snapped = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-pen-alignment-guide-commit-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 300 },
    { x: 700, y: 500 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await designPage.selectTool('pen');
  await designPage.click(900, 300);
  await designPage.click(700, 600); // exactly on shape A's column — where the guide should have snapped
  await designPage.pointerMove(1500, 900);
  const exact = await designPage.canvas.screenshot();

  expect(snapped.equals(exact)).toBe(true);
});
