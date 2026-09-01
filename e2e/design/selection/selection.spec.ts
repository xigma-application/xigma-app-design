import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('shift-click adds a second frame to the selection and draws the shared group outline', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-shift-click');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // A
  await designPage.drawFrame(900, 100, 940, 140); // B

  await designPage.click(720, 120); // select A
  const singleSelection = await designPage.canvas.screenshot();

  await designPage.click(920, 120, { shift: true }); // add B
  const groupSelection = await designPage.canvas.screenshot();

  expect(groupSelection.equals(singleSelection)).toBe(false);
});

test('pressing Escape deselects the currently selected frame, the same as clicking empty canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-escape-deselect');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // auto-selected on creation
  await designPage.pointerMove(1500, 700); // neutral resting point, avoids hover-outline artifacts

  const selected = await designPage.canvas.screenshot();

  await page.keyboard.press('Escape');
  await designPage.pointerMove(1500, 700);

  const afterEscape = await designPage.canvas.screenshot();

  expect(afterEscape.equals(selected)).toBe(false);

  // reference: the identical frame, deselected the ordinary way by clicking empty canvas
  await designPage.goto('e2e-test-selection-escape-deselect-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawFrame(700, 100, 740, 140);
  await designPage.click(1500, 600);
  await designPage.pointerMove(1500, 700);

  const deselected = await designPage.canvas.screenshot();

  expect(afterEscape.equals(deselected)).toBe(true);
});

test('clicking an unselected frame inside a multi-selection does not replace the selection until release', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-gap-click');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // A
  await designPage.drawFrame(800, 100, 840, 140); // C — sits unselected, inside A+B's shared bounds
  await designPage.drawFrame(900, 100, 940, 140); // B

  await designPage.click(720, 120); // select A
  await designPage.click(920, 120, { shift: true }); // add B — shared outline now spans A..B, covering C

  // rest the cursor on C first so the hover outline is already there for both captures below —
  // otherwise the hover highlight introduced by useHoverHighlight would itself make the two
  // screenshots differ, unrelated to what this test is actually checking
  await designPage.pointerMove(820, 120);
  const groupSelection = await designPage.canvas.screenshot();

  // pressing down on C must not flicker the outline away from the group while the button is held
  await designPage.pointerDown(820, 120);
  const heldOnUnselectedNode = await designPage.canvas.screenshot();
  expect(heldOnUnselectedNode.equals(groupSelection)).toBe(true);

  // releasing without moving replaces the selection with the node that was actually clicked
  await designPage.pointerUp();
  const releasedOnUnselectedNode = await designPage.canvas.screenshot();
  expect(releasedOnUnselectedNode.equals(groupSelection)).toBe(false);
});

test('selecting a frame still works after panning the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-pan');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // A, center at screen (720, 120)

  const dx = 150;
  const dy = 90;

  await designPage.panBy(dx, dy);

  // A rendered at screen (720, 120) before the pan now renders at (720 + dx, 120 + dy) — the world
  // position never changed, only the viewport offset did
  await designPage.click(720 + dx, 120 + dy);
  const selected = await designPage.canvas.screenshot();

  await designPage.click(610, 10); // empty canvas, well away from the panned frame — deselects
  const deselected = await designPage.canvas.screenshot();

  expect(selected.equals(deselected)).toBe(false);
});

test('selecting a frame still works after zooming the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-zoom');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // A, center at screen (720, 120)

  // zooming with the anchor at A's own center keeps that exact screen point mapped to the same
  // world point (A's center) afterwards, regardless of the resulting zoom factor
  await designPage.zoomAt(720, 120, -240);

  await designPage.click(720, 120);
  const selected = await designPage.canvas.screenshot();

  await designPage.click(610, 10); // empty canvas — deselects
  const deselected = await designPage.canvas.screenshot();

  expect(selected.equals(deselected)).toBe(false);
});

test('dragging a marquee live-selects the frames it covers, then keeps the selection after release', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-marquee-live');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // P
  await designPage.click(1500, 600); // deselect P — it's auto-selected on creation, but this baseline must be the empty-selection state
  const baseline = await designPage.canvas.screenshot();

  // drag a marquee box that fully covers P — selection (and the marquee overlay itself) must
  // update live, before the button is released
  await designPage.pointerDown(680, 80);
  await designPage.pointerMove(760, 160);
  const midDrag = await designPage.canvas.screenshot();

  expect(midDrag.equals(baseline)).toBe(false);

  await designPage.pointerUp();
  const afterRelease = await designPage.canvas.screenshot();

  // the marquee overlay itself disappears on release, so mid-drag and post-release frames differ,
  // but the selection outline on P must still be there — both must differ from the empty baseline
  expect(afterRelease.equals(midDrag)).toBe(false);
  expect(afterRelease.equals(baseline)).toBe(false);
});

test('marquee selection distinguishes a touched frame from a fully-contained one via Control', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-marquee-control');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // P — fully inside the marquee below
  await designPage.drawFrame(780, 100, 840, 140); // Q — only partially overlapped by the marquee

  // touch mode (no modifier): the marquee only needs to touch a frame to select it
  await designPage.pointerDown(690, 90);
  await designPage.pointerMove(830, 150);
  await designPage.pointerUp();
  const touchModeSelection = await designPage.canvas.screenshot();

  // clear, then drag the identical box again with Control held — full containment required now
  await designPage.click(610, 10);
  await page.keyboard.down('Control');
  await designPage.pointerDown(690, 90);
  await designPage.pointerMove(830, 150);
  await designPage.pointerUp();
  await page.keyboard.up('Control');
  const containModeSelection = await designPage.canvas.screenshot();

  // Q is selected in touch mode but not in contain mode — the two results must differ
  expect(touchModeSelection.equals(containModeSelection)).toBe(false);
});

test('clicking a text node inside its fixed box but past its rendered content does not select it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-text-empty-area');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(700, 100, 1000, 300); // a much bigger box than "Hi" needs
  await designPage.typeText('Hi');
  await designPage.click(1100, 500); // click away, well outside the box, to commit
  const baseline = await designPage.canvas.screenshot();

  await designPage.click(950, 250); // deep inside the box, but past the rendered "Hi"
  const afterClick = await designPage.canvas.screenshot();

  expect(afterClick.equals(baseline)).toBe(true);
});

test('a selected text node can be dragged from anywhere in its fixed box, even past its rendered content', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-text-drag-empty-area');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(700, 100, 1000, 300); // a much bigger box than "Hi" needs
  await designPage.typeText('Hi');
  await designPage.click(1100, 500); // click away, well outside the box, to commit

  await designPage.click(705, 108); // select it by clicking directly on the "Hi" glyphs
  const selected = await designPage.canvas.screenshot();

  // drag from deep inside the box, past the rendered content — must still move the node
  await designPage.pointerDown(950, 250);
  await designPage.pointerMove(1050, 350);
  await designPage.pointerUp();
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(selected)).toBe(false);
});

test('clicking inside an unfilled vector node, past its own contour, does not select it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-vector-empty-area');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 200 },
    { x: 850, y: 200 },
    { x: 850, y: 350 },
    { x: 700, y: 350 },
    { x: 700, y: 200 }, // close the loop
  ]);
  await designPage.selectTool('default'); // exit vector edit mode
  await designPage.click(1500, 700); // deselect — empty canvas
  const baseline = await designPage.canvas.screenshot();

  await designPage.click(775, 275); // dead center of the unfilled square, well past its contour
  const afterClick = await designPage.canvas.screenshot();

  expect(afterClick.equals(baseline)).toBe(true);
});

test('a selected vector node can be dragged from anywhere in its bounding box, even past its own contour', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-vector-drag-empty-area');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 200 },
    { x: 850, y: 200 },
    { x: 850, y: 350 },
    { x: 700, y: 350 },
    { x: 700, y: 200 },
  ]);
  await designPage.selectTool('default');
  await designPage.click(1500, 700); // deselect

  await designPage.click(700, 275); // select it by clicking directly on its left edge (contour)
  const selected = await designPage.canvas.screenshot();

  // drag from deep inside the box, past its own contour — must still move the node
  await designPage.pointerDown(775, 275);
  await designPage.pointerMove(875, 375);
  await designPage.pointerUp();
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(selected)).toBe(false);
});

test('clicking (without dragging) a selected vector node past its own contour deselects it, same as missing the shape entirely', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-vector-click-deselect');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 700, y: 200 },
    { x: 850, y: 200 },
    { x: 850, y: 350 },
    { x: 700, y: 350 },
    { x: 700, y: 200 },
  ]);
  await designPage.selectTool('default');
  await designPage.click(1500, 700); // deselect

  await designPage.click(700, 275); // select it by clicking directly on its left edge (contour)
  const selected = await designPage.canvas.screenshot();

  // a plain click (no drag) deep inside the box, past its own contour — must deselect, not just sit there
  await designPage.click(775, 275);
  const afterClick = await designPage.canvas.screenshot();

  expect(afterClick.equals(selected)).toBe(false);
});

test('a plain click on an unselected shape stacked on top of the selected one selects the top shape', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-click-through-selected');
  await expect(designPage.canvas).toBeVisible();

  // A big, then B small and fully inside A — B is drawn last, so it stacks on top of A
  await designPage.drawRectangle(700, 200, 900, 400); // A
  await designPage.drawRectangle(760, 260, 820, 320); // B

  await designPage.click(710, 210); // select A by its exposed top-left corner, clear of B

  const beforeIds = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return { rootOrder: pages[activePageId].rootOrder, selectedIds: pages[activePageId].selectedIds };
  });
  expect(beforeIds.selectedIds).toEqual([beforeIds.rootOrder[0]]); // A selected

  await designPage.click(790, 290); // plain click squarely on B, which overlaps A there

  const afterIds = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  // the already-selected A must not swallow the click — B, the top-most shape, gets selected
  expect(afterIds).toEqual([beforeIds.rootOrder[1]]);
});
