import { test, expect } from '@playwright/test';

// pages
import { DesignPage } from './DesignPage';

test('shift-click adds a second frame to the selection and draws the shared group outline', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-shift-click');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(100, 100, 140, 140); // A
  await designPage.drawFrame(300, 100, 340, 140); // B

  await designPage.click(120, 120); // select A
  const singleSelection = await designPage.canvas.screenshot();

  await designPage.click(320, 120, { shift: true }); // add B
  const groupSelection = await designPage.canvas.screenshot();

  expect(groupSelection.equals(singleSelection)).toBe(false);
});

test('clicking an unselected frame inside a multi-selection does not replace the selection until release', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-gap-click');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(100, 100, 140, 140); // A
  await designPage.drawFrame(200, 100, 240, 140); // C — sits unselected, inside A+B's shared bounds
  await designPage.drawFrame(300, 100, 340, 140); // B

  await designPage.click(120, 120); // select A
  await designPage.click(320, 120, { shift: true }); // add B — shared outline now spans A..B, covering C

  // rest the cursor on C first so the hover outline is already there for both captures below —
  // otherwise the hover highlight introduced by useHoverHighlight would itself make the two
  // screenshots differ, unrelated to what this test is actually checking
  await designPage.pointerMove(220, 120);
  const groupSelection = await designPage.canvas.screenshot();

  // pressing down on C must not flicker the outline away from the group while the button is held
  await designPage.pointerDown(220, 120);
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

  await designPage.drawFrame(100, 100, 140, 140); // A, center at screen (120, 120)

  const dx = 150;
  const dy = 90;

  await designPage.panBy(dx, dy);

  // A rendered at screen (120, 120) before the pan now renders at (120 + dx, 120 + dy) — the world
  // position never changed, only the viewport offset did
  await designPage.click(120 + dx, 120 + dy);
  const selected = await designPage.canvas.screenshot();

  await designPage.click(10, 10); // empty canvas, well away from the panned frame — deselects
  const deselected = await designPage.canvas.screenshot();

  expect(selected.equals(deselected)).toBe(false);
});

test('selecting a frame still works after zooming the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-zoom');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(100, 100, 140, 140); // A, center at screen (120, 120)

  // zooming with the anchor at A's own center keeps that exact screen point mapped to the same
  // world point (A's center) afterwards, regardless of the resulting zoom factor
  await designPage.zoomAt(120, 120, -240);

  await designPage.click(120, 120);
  const selected = await designPage.canvas.screenshot();

  await designPage.click(10, 10); // empty canvas — deselects
  const deselected = await designPage.canvas.screenshot();

  expect(selected.equals(deselected)).toBe(false);
});

test('dragging a marquee live-selects the frames it covers, then keeps the selection after release', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-marquee-live');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(100, 100, 140, 140); // P
  const baseline = await designPage.canvas.screenshot();

  // drag a marquee box that fully covers P — selection (and the marquee overlay itself) must
  // update live, before the button is released
  await designPage.pointerDown(80, 80);
  await designPage.pointerMove(160, 160);
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

  await designPage.drawFrame(100, 100, 140, 140); // P — fully inside the marquee below
  await designPage.drawFrame(180, 100, 240, 140); // Q — only partially overlapped by the marquee

  // touch mode (no modifier): the marquee only needs to touch a frame to select it
  await designPage.pointerDown(90, 90);
  await designPage.pointerMove(230, 150);
  await designPage.pointerUp();
  const touchModeSelection = await designPage.canvas.screenshot();

  // clear, then drag the identical box again with Control held — full containment required now
  await designPage.click(10, 10);
  await page.keyboard.down('Control');
  await designPage.pointerDown(90, 90);
  await designPage.pointerMove(230, 150);
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

  await designPage.drawTextBox(100, 100, 400, 300); // a much bigger box than "Hi" needs
  await designPage.typeText('Hi');
  await designPage.click(500, 500); // click away, well outside the box, to commit
  const baseline = await designPage.canvas.screenshot();

  await designPage.click(350, 250); // deep inside the box, but past the rendered "Hi"
  const afterClick = await designPage.canvas.screenshot();

  expect(afterClick.equals(baseline)).toBe(true);
});

test('a selected text node can be dragged from anywhere in its fixed box, even past its rendered content', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-text-drag-empty-area');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(100, 100, 400, 300); // a much bigger box than "Hi" needs
  await designPage.typeText('Hi');
  await designPage.click(500, 500); // click away, well outside the box, to commit

  await designPage.click(105, 108); // select it by clicking directly on the "Hi" glyphs
  const selected = await designPage.canvas.screenshot();

  // drag from deep inside the box, past the rendered content — must still move the node
  await designPage.pointerDown(350, 250);
  await designPage.pointerMove(450, 350);
  await designPage.pointerUp();
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(selected)).toBe(false);
});
