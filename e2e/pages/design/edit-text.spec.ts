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
