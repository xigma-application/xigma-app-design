import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

test('double-clicking an unselected text node enters edit mode with all its content selected, so typing replaces it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-select-all-flipped');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('HELLO');
  await designPage.click(1550, 600); // commit; the node is not selected afterward

  await designPage.doubleClick(905, 310); // on the rendered "H" glyph
  await designPage.typeText('BYE');
  await designPage.click(1550, 600); // commit the edit, deselecting it

  const replaced = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-edit-text-select-all-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('BYE');
  await designPage.click(1550, 600);

  const reference = await designPage.canvas.screenshot();

  expect(replaced.equals(reference)).toBe(true);
});

test('re-entering edit mode on a multi-line text node selects all of its content, not just the first line', async ({ page }) => {
  const designPage = new DesignPage(page);

  // typing \n presses Enter, producing real browser-typed multi-line content (a loose first line
  // followed by <div>-wrapped lines) — the same structure useStraightCaretEditing's own document-level
  // dblclick listener (word-select-while-already-editing) used to race against, narrowing the "select
  // all" this same double-click just triggered down to whichever line/word sat under the pointer
  await designPage.goto('e2e-test-edit-text-multiline-select-all');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 400);
  await designPage.typeText('hi\nthere\nyou');
  await designPage.click(1550, 600); // commit; the node is not selected afterward

  await designPage.doubleClick(905, 310); // re-enter editing on the rendered "h" of the first line
  await designPage.typeText('BYE'); // replaces the selection — must replace all 3 lines, not just one
  await designPage.click(1550, 600); // commit the edit, deselecting it

  const replaced = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-edit-text-multiline-select-all-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 400);
  await designPage.typeText('BYE');
  await designPage.click(1550, 600);

  const reference = await designPage.canvas.screenshot();

  expect(replaced.equals(reference)).toBe(true);
});

test('clearing all content on an existing text node and blurring deletes it, instead of leaving the original content untouched', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-clear-to-empty');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('HELLO');
  await designPage.click(1550, 600); // commit

  const withText = await designPage.canvas.screenshot();

  await designPage.doubleClick(905, 310); // re-enter edit mode, all content selected
  await page.keyboard.press('Backspace'); // clear to empty
  await designPage.click(1550, 600); // blur with no content

  const afterClearing = await designPage.canvas.screenshot();

  // reference: a fresh page where nothing was ever drawn
  await designPage.goto('e2e-test-edit-text-clear-to-empty-reference');
  await expect(designPage.canvas).toBeVisible();

  const neverDrawn = await designPage.canvas.screenshot();

  expect(afterClearing.equals(withText)).toBe(false);
  expect(afterClearing.equals(neverDrawn)).toBe(true);
});

test('pressing Escape while typing fresh text with content commits it and leaves it selected, unlike a plain blur which deselects', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-escape-select-new');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('HELLO');
  await page.keyboard.press('Escape');
  await designPage.pointerMove(1500, 700); // rest the pointer somewhere neutral before capturing —
  // Escape never moves the mouse, so the hover outline (independent of selection) would otherwise
  // depend on wherever the previous gesture happened to leave it, for a reason unrelated to
  // selection (see TEST_CASES.md's "Gotcha for other e2e tests")

  const afterEscape = await designPage.canvas.screenshot();

  // reference: commit the identical box via a normal blur (deselects), then manually click it to
  // select it the ordinary way — the known-correct "selected" render to compare against
  await designPage.goto('e2e-test-text-escape-select-new-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('HELLO');
  await designPage.click(1550, 600); // commit via blur, deselecting
  await designPage.click(905, 310); // select it via a plain click on the rendered glyph
  await designPage.pointerMove(1500, 700); // same neutral point, so hover state matches

  const manuallySelected = await designPage.canvas.screenshot();

  expect(afterEscape.equals(manuallySelected)).toBe(true);
});

test('pressing Escape while drawing fresh text with no content discards it, same as blurring it away empty', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-escape-discard-empty');
  await expect(designPage.canvas).toBeVisible();

  const before = await designPage.canvas.screenshot();

  await designPage.drawTextBox(900, 300, 1100, 340);
  await page.keyboard.press('Escape');

  const afterEscape = await designPage.canvas.screenshot();

  expect(afterEscape.equals(before)).toBe(true);
});

test('pressing Escape while re-editing an existing text node exits editing and selects it; a second Escape then deselects it', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-escape-existing');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('HELLO');
  await designPage.click(1550, 600); // commit, deselected
  await designPage.pointerMove(1500, 700); // neutral resting point, see the note below

  const committedDeselected = await designPage.canvas.screenshot();

  await designPage.doubleClick(905, 310); // re-enter editing
  await page.keyboard.press('Escape'); // first Escape: exits editing, stays selected
  await designPage.pointerMove(1500, 700); // Escape never moves the mouse, so rest it back at the
  // same neutral point before every capture below — otherwise the hover outline (independent of
  // selection) would depend on wherever the previous gesture left the pointer, for a reason
  // unrelated to selection (see TEST_CASES.md's "Gotcha for other e2e tests")

  const afterFirstEscape = await designPage.canvas.screenshot();

  expect(afterFirstEscape.equals(committedDeselected)).toBe(false);

  await page.keyboard.press('Escape'); // second Escape: deselects
  await designPage.pointerMove(1500, 700);

  const afterSecondEscape = await designPage.canvas.screenshot();

  expect(afterSecondEscape.equals(committedDeselected)).toBe(true);

  // reference: confirm afterFirstEscape genuinely matches a real "selected" render — select the
  // same committed text the ordinary way via a plain click
  await designPage.goto('e2e-test-text-escape-existing-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('HELLO');
  await designPage.click(1550, 600);
  await designPage.click(905, 310);
  await designPage.pointerMove(1500, 700);

  const manuallySelected = await designPage.canvas.screenshot();

  expect(afterFirstEscape.equals(manuallySelected)).toBe(true);
});

test('double-clicking a word while actively typing new text selects it, so typing replaces just that word', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-word-select-new-text');
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('HELLO WORLD');

  await designPage.doubleClick(905, 310); // select "HELLO" on the rendered "H", still actively typing (never committed)
  await designPage.typeText('BYE');
  await designPage.click(1550, 600); // commit

  const replaced = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-word-select-new-text-reference');
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('BYE WORLD');
  await designPage.click(1550, 600);

  const reference = await designPage.canvas.screenshot();

  expect(replaced.equals(reference)).toBe(true);
});

test('double-clicking to select a word while re-editing existing text does not discard the newly typed content', async ({ page }) => {
  const designPage = new DesignPage(page);

  // the second double-click is the regression case: useTextEditOnDoubleClick used to hit-test
  // against the node's stale, already-committed content ("ORIGINAL") instead of leaving the live,
  // unsaved edit session alone, silently reverting whatever was typed since re-entering
  await designPage.goto('e2e-test-word-select-no-reset');
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('ORIGINAL');
  await designPage.click(1550, 600); // commit

  await designPage.doubleClick(905, 310); // re-enter, select-all
  await designPage.typeText('HELLO WORLD'); // replaces the selection with new, unsaved content
  await designPage.doubleClick(905, 310); // double-click a word within the new (unsaved) content
  await designPage.typeText('BYE');
  await designPage.click(1550, 600); // commit

  const replaced = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-word-select-no-reset-reference');
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('BYE WORLD');
  await designPage.click(1550, 600);

  const reference = await designPage.canvas.screenshot();

  expect(replaced.equals(reference)).toBe(true);
});

test('a rotated text node keeps rendering at its own rotation while being edited, not axis-aligned', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-rotated');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('SPIN');
  await designPage.click(1550, 600); // commit

  await designPage.click(905, 310); // select it
  await designPage.pointerDown(890, 290); // rotate ring just outside the "nw" handle
  await designPage.pointerMove(1020, 250); // swing around the center for a clear rotation
  await designPage.pointerUp();

  await designPage.doubleClick(1000, 320); // the box's own center — invariant under its own rotation
  const rotatedWhileEditing = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-edit-text-unrotated-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('SPIN');
  await designPage.click(1550, 600);

  await designPage.click(905, 310);
  await designPage.doubleClick(1000, 320);
  const unrotatedWhileEditing = await designPage.canvas.screenshot();

  expect(rotatedWhileEditing.equals(unrotatedWhileEditing)).toBe(false);
});

test('the canvas-drawn selection highlight on a rotated node disappears once the selection collapses to a caret', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-rotated-selection-highlight');
  await expect(designPage.canvas).toBeVisible();

  // "SPIN" (not "SPIN ME") — proven at the identical box/rotation above to still reach the box's
  // own rotation-invariant center once rotated, so the double-click below actually hits the glyphs
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('SPIN');
  await designPage.click(1550, 600); // commit

  await designPage.click(905, 310); // select it
  await designPage.pointerDown(890, 290); // rotate ring just outside the "nw" handle
  await designPage.pointerMove(1020, 250); // swing around the center for a clear rotation
  await designPage.pointerUp();

  // the drag above rotates by ~90.69deg (getAngleBetweenPoints((1000,320),(1020,250)) -
  // getAngleBetweenPoints((1000,320),(890,290))); (1011,225) is that rotation applied to (905,310)
  // [the safe on-glyph point for this box] around the center — the rotation-invariant center itself
  // sits well past "SPIN"'s own width, same issue as the upside-down "Hi" case above
  await designPage.doubleClick(1011, 225); // re-enter edit mode, which selects all content
  const selectedAll = await designPage.canvas.screenshot();

  await page.keyboard.press('ArrowRight'); // collapses the selection to a caret at its end
  const collapsed = await designPage.canvas.screenshot();

  expect(selectedAll.equals(collapsed)).toBe(false);
});

test('double-clicking a selected text node past its rendered content (but inside its fixed box) does not enter edit mode', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-edit-text-selected-bounds-flipped');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1300, 500);
  await designPage.typeText('HI');
  await designPage.click(1550, 600); // commit

  await designPage.click(905, 310); // select it, on the rendered glyphs
  await designPage.pointerMove(1500, 700); // neutral resting point, avoids hover-outline artifacts
  const selected = await designPage.canvas.screenshot();

  // deep inside the box, far from "HI" — entering edit mode requires actually hitting the glyphs,
  // so this double-click must have no visible effect at all: no edit overlay, no content change
  await designPage.doubleClick(1200, 450);
  await designPage.pointerMove(1500, 700); // same neutral resting point as above
  const afterDoubleClick = await designPage.canvas.screenshot();

  expect(afterDoubleClick.equals(selected)).toBe(true);
});

test('clicking a point on an upside-down (180-degree rotated) text box places the caret there, not always at the end', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x40 box at (900,300)-(1100,340); once rotated 180 degrees around its own center (1000,320),
  // the rendered "H"/"i" boundary sits at world (1089.5, 320) and the end of "i" at world (1086, 320) —
  // reversed from their unrotated positions, since the box now reads right-to-left on screen
  await designPage.goto('e2e-test-rotated-caret-mid-insert');
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('Hi');
  await designPage.click(1550, 600); // commit

  await designPage.click(905, 310); // select it
  await designPage.pointerDown(890, 290); // rotate ring just outside the "nw" handle
  await designPage.pointerMove(1110, 350); // the reflection of (890,290) through the box's own center -> exactly 180 degrees
  await designPage.pointerUp();

  // (1095,330) is the 180deg reflection of (905,310) [the safe on-glyph point used elsewhere for
  // this box] around the center (1000,320) — actually lands on the now-upside-down "Hi" glyphs,
  // unlike the box's own rotation-invariant center, which sits well past this short word's width
  await designPage.doubleClick(1095, 330); // re-enter editing on the rendered (now upside-down) "Hi"
  await designPage.click(1089.5, 320); // the boundary between "H" and "i" on the now-upside-down text
  await designPage.typeText('X');
  await designPage.click(1550, 600); // commit
  const midInsertion = await designPage.canvas.screenshot();

  // same box/content/rotation, but the click lands just past "i" instead — the caret should land at
  // the end, producing a visibly different render for the same typed character
  await designPage.goto('e2e-test-rotated-caret-end-insert');
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('Hi');
  await designPage.click(1550, 600);

  await designPage.click(905, 310);
  await designPage.pointerDown(890, 290);
  await designPage.pointerMove(1110, 350);
  await designPage.pointerUp();

  await designPage.doubleClick(1095, 330); // re-enter editing on the rendered (now upside-down) "Hi"
  await designPage.click(1086, 320); // just past "i" on the now-upside-down text
  await designPage.typeText('X');
  await designPage.click(1550, 600);
  const endInsertion = await designPage.canvas.screenshot();

  expect(midInsertion.equals(endInsertion)).toBe(false);
});

test('clicking a point on a plain (unrotated, unflipped) text box places the caret there, not always at the end', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x40 box at (900,300)-(1100,340); "Hi" renders with the "H"/"i" boundary at world (910.5, 320)
  // and the end of "i" at world (914, 320) — the same box/content as the rotated variant above, but
  // never rotated, so pointer-events: none on the editing overlay means every click here also falls
  // through straight to the canvas underneath, same as the rotated case
  await designPage.goto('e2e-test-plain-caret-mid-insert');
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('Hi');
  await designPage.click(1550, 600); // commit

  await designPage.doubleClick(905, 310); // re-enter editing on the rendered "H"
  await designPage.click(910.5, 320); // the boundary between "H" and "i"
  await designPage.typeText('X');
  await designPage.click(1550, 600); // commit
  const midInsertion = await designPage.canvas.screenshot();

  // same box/content, but the click lands just past "i" instead — the caret should land at the
  // end, producing a visibly different render for the same typed character
  await designPage.goto('e2e-test-plain-caret-end-insert');
  await designPage.drawTextBox(900, 300, 1100, 340);
  await designPage.typeText('Hi');
  await designPage.click(1550, 600);

  await designPage.doubleClick(905, 310);
  await designPage.click(914, 320); // just past "i"
  await designPage.typeText('X');
  await designPage.click(1550, 600);
  const endInsertion = await designPage.canvas.screenshot();

  expect(midInsertion.equals(endInsertion)).toBe(false);
});
