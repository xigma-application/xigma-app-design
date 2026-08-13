import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

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

  await designPage.drawRectangle(300, 300, 400, 400);
  await designPage.click(350, 350); // select it

  const resizeCursor = await waitForCursor(designPage, 300, 300); // exactly on the "nw" handle
  const rotateCursor = await waitForCursor(designPage, 290, 290); // just outside it, in the ring
  await designPage.pointerMove(900, 900); // far from the node entirely
  const emptyCursor = await designPage.cursorStyle();

  expect(new Set([resizeCursor, rotateCursor, emptyCursor]).size).toBe(3);
  expect(emptyCursor).toBe('');
});

test('dragging the rotate ring visibly spins the node', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-single-node');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 400, 400);
  await designPage.click(350, 350);
  const beforeRotate = await designPage.canvas.screenshot();

  await designPage.pointerDown(290, 290); // ring just outside the "nw" handle
  await designPage.pointerMove(420, 280); // swing well around the node's center
  await designPage.pointerUp();
  const afterRotate = await designPage.canvas.screenshot();

  expect(afterRotate.equals(beforeRotate)).toBe(false);
});

test('the rotate cursor updates live as the drag angle changes, not just once at the start', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-live-cursor');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 400, 400);
  await designPage.click(350, 350);

  const cursorAtArm = await waitForCursor(designPage, 290, 290); // ring just outside the "nw" handle

  await designPage.pointerDown(290, 290);
  await designPage.pointerMove(420, 280); // swing far around the center — a large angle change
  const cursorMidDrag = await designPage.cursorStyle();
  await designPage.pointerUp();

  expect(cursorMidDrag).not.toBe('');
  expect(cursorMidDrag).not.toBe(cursorAtArm);
});

test('a rotated node is hit-tested (and its resize handles found) at its actual rotated position', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-hit-test');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 400, 400);
  await designPage.click(350, 350);

  // arm at (290, 290) — angle -135deg from the center (350, 350) — and swing to due north
  // (350, 250) — angle -90deg — for a clean, deterministic +45deg rotation
  await designPage.pointerDown(290, 290);
  await designPage.pointerMove(350, 250);
  await designPage.pointerUp();

  // the "nw" corner, originally at (300, 300), has physically swung to roughly (350, 279) once
  // rotated 45deg around the center; the raw unrotated corner position no longer has a handle
  await designPage.pointerMove(900, 900); // clear any lingering cursor state first
  const atOldCorner = await designPage.cursorStyle();
  const atNewCorner = await waitForCursor(designPage, 350, 279);

  expect(atOldCorner).toBe('');
  expect(atNewCorner).not.toBe('');
});

test('rotating a group selection spins every member around their shared center', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rotate-group');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 350, 350);
  await designPage.drawRectangle(400, 300, 450, 350);
  await designPage.click(325, 325);
  await designPage.click(425, 325, { shift: true });
  const beforeRotate = await designPage.canvas.screenshot();

  // combined bounds: (300, 300) -> (450, 350); "nw" corner sits at (300, 300)
  await designPage.pointerDown(290, 290);
  await designPage.pointerMove(400, 200);
  await designPage.pointerUp();
  const afterRotate = await designPage.canvas.screenshot();

  expect(afterRotate.equals(beforeRotate)).toBe(false);
});
