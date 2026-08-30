import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test.describe.configure({ mode: 'serial' });

test('a single continuous drag draws a visible stroke, and the tool stays active for an immediate second stroke', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pencil-draw-basic');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  const before = await designPage.canvas.screenshot();

  await designPage.drawPencilStroke([
    { x: 700, y: 400 },
    { x: 750, y: 360 },
    { x: 800, y: 340 },
    { x: 850, y: 360 },
    { x: 900, y: 400 },
  ]);
  const afterFirstStroke = await designPage.canvas.screenshot();

  expect(afterFirstStroke.equals(before)).toBe(false);

  // still on Pencil — the very next drag starts a brand-new, separate stroke with no reselect
  await expect(designPage.toolRadio('pencil')).toHaveAttribute('aria-checked', 'true');

  await designPage.drawPencilStroke([
    { x: 700, y: 550 },
    { x: 800, y: 520 },
    { x: 900, y: 550 },
  ]);
  const afterSecondStroke = await designPage.canvas.screenshot();

  expect(afterSecondStroke.equals(afterFirstStroke)).toBe(false);
});

test('a stroke drawn too short to clear the minimum size is discarded, drawing nothing', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pencil-sub-threshold-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  const before = await designPage.canvas.screenshot();

  await designPage.drawPencilStroke([
    { x: 700, y: 400 },
    { x: 700.5, y: 400 },
  ]);
  const after = await designPage.canvas.screenshot();

  expect(after.equals(before)).toBe(true);
});

test('Shift held mid-drag locks the segment to a straight line and holds it through a direction reversal', async ({ page }) => {
  const designPage = new DesignPage(page);

  // mock — freehand start, then Shift locks onto whichever axis the first post-Shift movement picks
  // (here, mostly horizontal), then the mouse reverses to mostly-vertical before releasing — the
  // locked axis must not re-evaluate mid-gesture
  await designPage.goto('e2e-test-pencil-shift-axis-lock');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  await designPage.pointerDown(700, 400);
  await designPage.pointerMove(750, 390);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(800, 395); // mostly horizontal — locks the x axis
  await designPage.pointerMove(850, 470); // reverses to mostly-vertical — must stay locked to x
  await designPage.pointerUp();
  await page.keyboard.up('Shift');
  const shiftLocked = await designPage.canvas.screenshot();

  // reference — the exact same raw points, but never holding Shift at all
  await designPage.goto('e2e-test-pencil-shift-axis-lock-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  await designPage.drawPencilStroke([
    { x: 700, y: 400 },
    { x: 750, y: 390 },
    { x: 800, y: 395 },
    { x: 850, y: 470 },
  ]);
  const plainFreehand = await designPage.canvas.screenshot();

  expect(shiftLocked.equals(plainFreehand)).toBe(false);
});

test('releasing Shift mid-drag resumes freehand drawing from the locked endpoint, instead of staying constrained', async ({ page }) => {
  const designPage = new DesignPage(page);

  // mock — Shift locks a horizontal segment, then Shift is released while still dragging and the
  // stroke continues diagonally — the tail after release must not still be axis-constrained
  await designPage.goto('e2e-test-pencil-shift-release-resumes-freehand');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  await designPage.pointerDown(700, 400);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(800, 410); // locks horizontal
  await page.keyboard.up('Shift');
  await designPage.pointerMove(900, 500); // resumes freehand — diagonal, not locked
  await designPage.pointerUp();
  const releasedMidDrag = await designPage.canvas.screenshot();

  // reference — Shift held for the entire gesture, including the final diagonal move, so it stays
  // locked to the horizontal axis throughout instead of resuming freehand
  await designPage.goto('e2e-test-pencil-shift-release-resumes-freehand-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  await designPage.pointerDown(700, 400);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(800, 410);
  await designPage.pointerMove(900, 500); // still locked — Shift never released
  await designPage.pointerUp();
  await page.keyboard.up('Shift');
  const stillLocked = await designPage.canvas.screenshot();

  expect(releasedMidDrag.equals(stillLocked)).toBe(false);
});

test('releasing the mouse button while Shift is still held still commits the axis-locked segment, instead of drawing nothing', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  // regression — a real user drag: hold Shift for the whole stroke and release the mouse button
  // first, with no separate Shift-keyup ever firing; the locked point must still get folded into the
  // committed shape, not silently dropped
  await designPage.goto('e2e-test-pencil-shift-held-through-mouseup');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  const before = await designPage.canvas.screenshot();

  await designPage.pointerDown(700, 400);
  await page.keyboard.down('Shift');
  await designPage.pointerMove(850, 410); // locks horizontal, well past the minimum shape size
  await designPage.pointerUp(); // mouse released — Shift is still down
  await page.keyboard.up('Shift'); // released only after the stroke has already ended

  const after = await designPage.canvas.screenshot();

  expect(after.equals(before)).toBe(false);
});

test('a committed Pencil stroke opens in Vector Edit Mode via double-click, and its vertices drag like an ordinary vector node', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-pencil-vector-edit-entry');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('pen', 'Pencil');
  await designPage.drawPencilStroke([
    { x: 700, y: 400 },
    { x: 750, y: 370 },
    { x: 800, y: 350 },
    { x: 850, y: 370 },
    { x: 900, y: 400 },
  ]);

  // double-click-to-edit only activates once the tool is Select/Move, not while Pencil is still active
  await designPage.selectTool('default');
  await designPage.pointerMove(1400, 700); // rest away from the stroke first, clearing any stale hover

  const notEditing = await designPage.canvas.screenshot();

  await designPage.doubleClick(700, 400); // the stroke's own start vertex — RDP always preserves endpoints
  const editing = await designPage.canvas.screenshot();

  expect(editing.equals(notEditing)).toBe(false);
  await expect(page.getByRole('button', { exact: true, name: 'Move' })).toHaveAttribute('aria-pressed', 'true');

  // dragging the start vertex behaves like any other vector node's vertex drag
  await designPage.dragVectorPoint(700, 400, 650, 450);
  const afterVertexDrag = await designPage.canvas.screenshot();

  expect(afterVertexDrag.equals(editing)).toBe(false);
});
