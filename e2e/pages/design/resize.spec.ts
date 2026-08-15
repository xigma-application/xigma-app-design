import path from 'path';
import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

const HAND_FIXTURE_PATH = path.join(import.meta.dirname, '../../../src/assets/icons/cursors/hand.png');

test.describe.configure({ mode: 'serial' });

const waitForResizeCursor = async (designPage: DesignPage, x: number, y: number): Promise<string> => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await designPage.pointerMove(x + (attempt % 2), y);

    const cursor = await designPage.cursorStyle();

    if (cursor) {
      return cursor;
    }
  }

  throw new Error('resize cursor never applied');
};

test('hovering different resize handle directions applies distinctly rotated cursors', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-cursor-rotation');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 450);
  await designPage.click(975, 375); // select it

  const seCursor = await waitForResizeCursor(designPage, 1050, 450); // "se" corner

  await designPage.pointerMove(1050, 375); // "e" edge
  const eCursor = await designPage.cursorStyle();

  await designPage.pointerMove(975, 300); // "n" edge
  const nCursor = await designPage.cursorStyle();

  await designPage.pointerMove(1050, 300); // "ne" corner
  const neCursor = await designPage.cursorStyle();

  expect(new Set([seCursor, eCursor, nCursor, neCursor]).size).toBe(4);
});

test('dragging a corner handle resizes the node while the opposite corner stays anchored', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-corner-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 450);
  await designPage.click(975, 375);
  const beforeResize = await designPage.canvas.screenshot();

  await designPage.pointerDown(1050, 450); // "se" handle
  await designPage.pointerMove(1150, 550);
  await designPage.pointerUp();
  const afterResize = await designPage.canvas.screenshot();

  expect(afterResize.equals(beforeResize)).toBe(false);

  // the dragged handle now lives at the new bottom-right position...
  expect(await waitForResizeCursor(designPage, 1150, 550)).not.toBe('');

  // ...while the opposite "nw" corner, never touched by the drag, is still exactly where it started
  expect(await waitForResizeCursor(designPage, 900, 300)).not.toBe('');
});

test('holding Shift while dragging a corner locks the aspect ratio, producing a different result than a free drag', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-shift-lock-free');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 350); // 100x50, a 2:1 rectangle
  await designPage.click(950, 325);

  await designPage.pointerDown(1000, 350); // "se" handle
  await designPage.pointerMove(1200, 400); // width grows far more than height — breaks the 2:1 ratio
  await designPage.pointerUp();
  const freeResize = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-resize-shift-lock-locked');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 350);
  await designPage.click(950, 325);

  await page.keyboard.down('Shift');
  await designPage.pointerDown(1000, 350);
  await designPage.pointerMove(1200, 400); // identical drag, but the 2:1 ratio must be preserved
  await designPage.pointerUp();
  await page.keyboard.up('Shift');
  const lockedResize = await designPage.canvas.screenshot();

  expect(lockedResize.equals(freeResize)).toBe(false);
});

test('dragging a corner past the opposite anchor mirrors the node instead of sticking at the minimum size', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-mirror-box');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 450);
  await designPage.click(975, 375);

  await designPage.pointerDown(1050, 450); // "se" handle
  await designPage.pointerMove(750, 150); // past the "nw" anchor at (900, 300)
  await designPage.pointerUp();

  expect(await waitForResizeCursor(designPage, 900, 300)).not.toBe('');
  expect(await waitForResizeCursor(designPage, 750, 150)).not.toBe('');
});

test('resizing a media node past its anchor mirrors the rendered image, not just its bounding box', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-mirror-media-flipped');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile(HAND_FIXTURE_PATH);
  await designPage.placeMediaAtNaturalSize(900, 300); // box: (900, 300) -> (1156, 556)
  await designPage.click(1000, 400); // select it

  await designPage.pointerDown(1156, 556);
  await designPage.pointerMove(644, 44); // crosses both anchors by exactly 256px
  await designPage.pointerUp();
  await designPage.click(1500, 900); // deselect, so the selection outline doesn't affect the pixels

  const flipped = await page.screenshot({ clip: { height: 256, width: 256, x: 644, y: 44 } });

  await designPage.goto('e2e-test-resize-mirror-media-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile(HAND_FIXTURE_PATH);
  await designPage.dragMedia(644, 44, 900, 300);

  const reference = await page.screenshot({ clip: { height: 256, width: 256, x: 644, y: 44 } });

  expect(flipped.equals(reference)).toBe(false);
});

test('resizing a text node past its anchor renders the text mirrored, not just repositioned', async ({ page }) => {
  const designPage = new DesignPage(page);

  // resulting box lands at exactly the rect an unflipped box would use
  await designPage.goto('e2e-test-resize-mirror-text-flipped');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(900, 300, 1100, 400); // box: (900, 300) -> (1100, 400), 200x100
  await designPage.typeText('MIRROR');
  await designPage.click(1500, 900); // click away to commit
  await designPage.click(905, 308); // select it, on the rendered glyphs

  await designPage.pointerDown(1100, 400);
  await designPage.pointerMove(700, 200); // crosses both anchors by exactly 200x100
  await designPage.pointerUp();
  await designPage.click(1500, 900); // deselect

  const flipped = await page.screenshot({ clip: { height: 100, width: 200, x: 700, y: 200 } });

  await designPage.goto('e2e-test-resize-mirror-text-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextBox(700, 200, 900, 300);
  await designPage.typeText('MIRROR');
  await designPage.click(1500, 900);

  const reference = await page.screenshot({ clip: { height: 100, width: 200, x: 700, y: 200 } });

  expect(flipped.equals(reference)).toBe(false);
});

test('resizing a polygon past its anchor renders the shape mirrored, not just repositioned', async ({ page }) => {
  const designPage = new DesignPage(page);

  // resulting box lands at exactly the rect an unflipped box would use
  await designPage.goto('e2e-test-resize-mirror-polygon-flipped');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawPolygon(900, 300, 1000, 400); // box: (900, 300) -> (1000, 400), 100x100 triangle
  await designPage.click(950, 350); // select it, on the central axis between the apex and base

  await designPage.pointerDown(1000, 400); // "se" handle
  await designPage.pointerMove(800, 200); // crosses both anchors by exactly 100x100
  await designPage.pointerUp();
  await designPage.click(1500, 900); // deselect

  const flipped = await page.screenshot({ clip: { height: 100, width: 100, x: 800, y: 200 } });

  await designPage.goto('e2e-test-resize-mirror-polygon-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawPolygon(800, 200, 900, 300);
  await designPage.click(1500, 900);

  const reference = await page.screenshot({ clip: { height: 100, width: 100, x: 800, y: 200 } });

  expect(flipped.equals(reference)).toBe(false);
});

test('resizing a rotated single node via an edge handle scales along its own local axis, not the raw screen axis', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-rotated-local-axis');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 400); // 100x100 square, center (950, 350)
  await designPage.click(950, 350);

  await designPage.pointerDown(890, 290);
  await designPage.pointerMove(1010, 290);
  await designPage.pointerUp();

  expect(await waitForResizeCursor(designPage, 950, 400)).not.toBe('');

  await designPage.pointerDown(950, 400);
  await designPage.pointerMove(950, 450);
  await designPage.pointerUp();

  expect(await waitForResizeCursor(designPage, 950, 300)).not.toBe('');

  await designPage.pointerMove(1500, 900); // clear lingering cursor state
  expect(await waitForResizeCursor(designPage, 950, 450)).not.toBe('');
});

test('dragging a rotated single node past its anchor mirrors it, instead of snapping back to the original box', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-rotated-mirror-crossing');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 400); // 100x100 square, center (950, 350)
  await designPage.click(950, 350);

  await designPage.pointerDown(890, 290);
  await designPage.pointerMove(1010, 290); // +90deg rotation
  await designPage.pointerUp();
  const beforeCross = await designPage.canvas.screenshot();

  // post-rotation, the local "se" corner handle sits at screen (900, 400), anchored at "nw" (1000, 300)
  await designPage.pointerDown(900, 400);
  await designPage.pointerMove(1100, 200); // full symmetric crossing past the anchor
  await designPage.pointerUp();
  const afterCross = await designPage.canvas.screenshot();

  // before the fix, the anchor-fixing solver assumed the anchor corner never changes local side,
  expect(afterCross.equals(beforeCross)).toBe(false);

  await designPage.click(1500, 900); // deselect so the selection outline doesn't affect the pixels
  const crossed = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-resize-rotated-mirror-crossing-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawRectangle(1000, 200, 1100, 300); // expected mirrored square: screen (1000,200)-(1100,300)
  await designPage.click(1050, 250);
  await designPage.pointerDown(990, 190);
  await designPage.pointerMove(1110, 190); // same +90deg rotation
  await designPage.pointerUp();
  await designPage.click(1500, 900);
  const reference = await designPage.canvas.screenshot();

  expect(crossed.equals(reference)).toBe(true);
});

test('resizing a star past its anchor renders the shape mirrored, not just repositioned', async ({ page }) => {
  const designPage = new DesignPage(page);

  // resulting box lands at exactly the rect an unflipped box would use
  await designPage.goto('e2e-test-resize-mirror-star-flipped');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawStar(900, 300, 1000, 400); // box: (900, 300) -> (1000, 400), 100x100 star
  await designPage.click(950, 350); // select it, at the center

  await designPage.pointerDown(1000, 400); // "se" handle
  await designPage.pointerMove(800, 200); // crosses both anchors by exactly 100x100
  await designPage.pointerUp();
  await designPage.click(1500, 900); // deselect

  const flipped = await page.screenshot({ clip: { height: 100, width: 100, x: 800, y: 200 } });

  await designPage.goto('e2e-test-resize-mirror-star-reference');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawStar(800, 200, 900, 300);
  await designPage.click(1500, 900);

  const reference = await page.screenshot({ clip: { height: 100, width: 100, x: 800, y: 200 } });

  expect(flipped.equals(reference)).toBe(false);
});
