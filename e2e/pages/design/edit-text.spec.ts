import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('double-clicking an unselected text node enters edit mode with all its content selected, so typing replaces it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-select-all-flipped');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(300, 300, 500, 340);
  await designPage.typeText('HELLO');
  await designPage.click(950, 600); // commit; the node is not selected afterward

  await designPage.doubleClick(305, 310); // on the rendered "H" glyph
  await designPage.typeText('BYE');
  await designPage.click(950, 600); // commit the edit, deselecting it

  const replaced = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-edit-text-select-all-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(300, 300, 500, 340);
  await designPage.typeText('BYE');
  await designPage.click(950, 600);

  const reference = await designPage.canvas.screenshot();

  expect(replaced.equals(reference)).toBe(true);
});

test('a rotated text node keeps rendering at its own rotation while being edited, not axis-aligned', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-rotated');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(300, 300, 500, 340);
  await designPage.typeText('SPIN');
  await designPage.click(950, 600); // commit

  await designPage.click(305, 310); // select it
  await designPage.pointerDown(290, 290); // rotate ring just outside the "nw" handle
  await designPage.pointerMove(420, 250); // swing around the center for a clear rotation
  await designPage.pointerUp();

  await designPage.doubleClick(400, 320); // the box's own center — invariant under its own rotation
  const rotatedWhileEditing = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-edit-text-unrotated-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(300, 300, 500, 340);
  await designPage.typeText('SPIN');
  await designPage.click(950, 600);

  await designPage.click(305, 310);
  await designPage.doubleClick(400, 320);
  const unrotatedWhileEditing = await designPage.canvas.screenshot();

  expect(rotatedWhileEditing.equals(unrotatedWhileEditing)).toBe(false);
});

test('the canvas-drawn selection highlight on a rotated node disappears once the selection collapses to a caret', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-rotated-selection-highlight');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(300, 300, 500, 340);
  await designPage.typeText('SPIN ME');
  await designPage.click(950, 600); // commit

  await designPage.click(305, 310); // select it
  await designPage.pointerDown(290, 290); // rotate ring just outside the "nw" handle
  await designPage.pointerMove(420, 250); // swing around the center for a clear rotation
  await designPage.pointerUp();

  await designPage.doubleClick(400, 320); // re-enter edit mode, which selects all content
  const selectedAll = await designPage.canvas.screenshot();

  await page.keyboard.press('ArrowRight'); // collapses the selection to a caret at its end
  const collapsed = await designPage.canvas.screenshot();

  expect(selectedAll.equals(collapsed)).toBe(false);
});

test('double-clicking a selected text node past its rendered content (but inside its fixed box) still enters edit mode', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-selected-bounds-flipped');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(300, 300, 700, 500);
  await designPage.typeText('HI');
  await designPage.click(950, 600); // commit

  await designPage.click(305, 310); // select it, on the rendered glyphs
  await designPage.doubleClick(600, 450); // deep inside the box, far from "HI"
  await designPage.typeText('OK');
  await designPage.click(950, 600); // commit the edit, deselecting it

  const replaced = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-edit-text-selected-bounds-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(300, 300, 700, 500);
  await designPage.typeText('OK');
  await designPage.click(950, 600);

  const reference = await designPage.canvas.screenshot();

  expect(replaced.equals(reference)).toBe(true);
});

test('clicking a point on an upside-down (180-degree rotated) text box places the caret there, not always at the end', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x40 box at (300,300)-(500,340); once rotated 180 degrees around its own center (400,320),
  // the rendered "H"/"i" boundary sits at world (489.5, 320) and the end of "i" at world (486, 320) —
  // reversed from their unrotated positions, since the box now reads right-to-left on screen
  await designPage.goto('e2e-test-rotated-caret-mid-insert');
  await designPage.drawTextBox(300, 300, 500, 340);
  await designPage.typeText('Hi');
  await designPage.click(950, 600); // commit

  await designPage.click(305, 310); // select it
  await designPage.pointerDown(290, 290); // rotate ring just outside the "nw" handle
  await designPage.pointerMove(510, 350); // the reflection of (290,290) through the box's own center -> exactly 180 degrees
  await designPage.pointerUp();

  await designPage.doubleClick(400, 320); // re-enter editing at the box's own (rotation-invariant) center
  await designPage.click(489.5, 320); // the boundary between "H" and "i" on the now-upside-down text
  await designPage.typeText('X');
  await designPage.click(950, 600); // commit
  const midInsertion = await designPage.canvas.screenshot();

  // same box/content/rotation, but the click lands just past "i" instead — the caret should land at
  // the end, producing a visibly different render for the same typed character
  await designPage.goto('e2e-test-rotated-caret-end-insert');
  await designPage.drawTextBox(300, 300, 500, 340);
  await designPage.typeText('Hi');
  await designPage.click(950, 600);

  await designPage.click(305, 310);
  await designPage.pointerDown(290, 290);
  await designPage.pointerMove(510, 350);
  await designPage.pointerUp();

  await designPage.doubleClick(400, 320);
  await designPage.click(486, 320); // just past "i" on the now-upside-down text
  await designPage.typeText('X');
  await designPage.click(950, 600);
  const endInsertion = await designPage.canvas.screenshot();

  expect(midInsertion.equals(endInsertion)).toBe(false);
});
