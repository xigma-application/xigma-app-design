import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test.describe.configure({ mode: 'serial' });

const waitForCursor = async (designPage: DesignPage, x: number, y: number): Promise<string> => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await designPage.pointerMove(x + (attempt % 2), y);

    const cursor = await designPage.cursorStyle();

    if (cursor) {
      return cursor;
    }
  }

  throw new Error('cursor never applied');
};

test('hovering the ring just outside a resize handle applies a distinct rotate cursor', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-cursor');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 400);
  await designPage.click(950, 350); // select it

  const resizeCursor = await waitForCursor(designPage, 900, 300); // exactly on the "nw" handle
  const rotateCursor = await waitForCursor(designPage, 890, 290); // just outside it, in the ring
  await designPage.pointerMove(1500, 900); // far from the node entirely
  const emptyCursor = await designPage.cursorStyle();

  expect(new Set([resizeCursor, rotateCursor, emptyCursor]).size).toBe(3);
  expect(emptyCursor).toBe('');
});

test('dragging the rotate ring visibly spins the node', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-single-node');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 400);
  await designPage.click(950, 350);
  const beforeRotate = await designPage.canvas.screenshot();

  await designPage.pointerDown(890, 290); // ring just outside the "nw" handle
  await designPage.pointerMove(1020, 280); // swing well around the node's center
  await designPage.pointerUp();
  const afterRotate = await designPage.canvas.screenshot();

  expect(afterRotate.equals(beforeRotate)).toBe(false);
});

test('the rotate cursor updates live as the drag angle changes, not just once at the start', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-live-cursor');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 400);
  await designPage.click(950, 350);

  const cursorAtArm = await waitForCursor(designPage, 890, 290); // ring just outside the "nw" handle

  await designPage.pointerDown(890, 290);
  await designPage.pointerMove(1020, 280); // swing far around the center — a large angle change
  const cursorMidDrag = await designPage.cursorStyle();
  await designPage.pointerUp();

  expect(cursorMidDrag).not.toBe('');
  expect(cursorMidDrag).not.toBe(cursorAtArm);
});

test('a rotated node is hit-tested (and its resize handles found) at its actual rotated position', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-hit-test');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 400);
  await designPage.click(950, 350);

  // arm at (890, 290) — angle -135deg from the center (950, 350) — and swing to due north
  // (950, 250) — angle -90deg — for a clean, deterministic +45deg rotation
  await designPage.pointerDown(890, 290);
  await designPage.pointerMove(950, 250);
  await designPage.pointerUp();

  // the "nw" corner, originally at (900, 300), has physically swung to roughly (950, 279) once
  // rotated 45deg around the center; the raw unrotated corner position no longer has a handle
  await designPage.pointerMove(1500, 900); // clear any lingering cursor state first
  const atOldCorner = await designPage.cursorStyle();
  const atNewCorner = await waitForCursor(designPage, 950, 279);

  expect(atOldCorner).toBe('');
  expect(atNewCorner).not.toBe('');
});

test('rotating a group selection spins every member around their shared center', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-group');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 950, 350);
  await designPage.drawRectangle(1000, 300, 1050, 350);
  await designPage.click(925, 325);
  await designPage.click(1025, 325, { shift: true });
  const beforeRotate = await designPage.canvas.screenshot();

  // combined bounds: (900, 300) -> (1050, 350); "nw" corner sits at (900, 300)
  await designPage.pointerDown(890, 290);
  await designPage.pointerMove(1000, 200);
  await designPage.pointerUp();
  const afterRotate = await designPage.canvas.screenshot();

  expect(afterRotate.equals(beforeRotate)).toBe(false);
});

test('a section resists rotation entirely — no rotate cursor, and dragging its corner ring never spins it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-section-resists');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSection(900, 300, 1000, 400);
  await designPage.click(950, 350); // select it

  // the same ring position that reliably applies a rotate cursor on a rectangle (see above)
  await designPage.pointerMove(890, 290);
  const cursor = await designPage.cursorStyle();

  expect(cursor).toBe('');

  await designPage.pointerMove(1500, 900); // neutral resting point, so hover isn't part of the diff
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(890, 290);
  await designPage.pointerMove(1020, 280); // the same swing that visibly spins a rectangle above
  await designPage.pointerUp();

  // whatever that drag did instead (armRotateOnPointerDown never claiming it, e.g. an empty
  // marquee), the section itself was never rotated — reselecting it lands on the exact same
  // pixels as before the drag
  await designPage.click(950, 350);
  await designPage.pointerMove(1500, 900);
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(true);
});
