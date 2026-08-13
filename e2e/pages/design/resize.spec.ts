import { test, expect } from '@playwright/test';

// pages
import { DesignPage } from './DesignPage';

// the base cursor image used for rotation is lazily constructed and decoded on first use, which
// can take close to a second on a cold page — nothing re-applies the cursor without a further
// pointermove, so (unlike expect.poll) this actually re-issues tiny moves on the same handle until
// the image is ready, exactly like the mouse jitter a real user produces while hovering
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

  await designPage.drawRectangle(300, 300, 450, 450);
  await designPage.click(375, 375); // select it

  const seCursor = await waitForResizeCursor(designPage, 450, 450); // "se" corner

  await designPage.pointerMove(450, 375); // "e" edge
  const eCursor = await designPage.cursorStyle();

  await designPage.pointerMove(375, 300); // "n" edge
  const nCursor = await designPage.cursorStyle();

  await designPage.pointerMove(450, 300); // "ne" corner
  const neCursor = await designPage.cursorStyle();

  // the base resize.png cursor is rotated on an offscreen <canvas> per handle direction — real
  // Image decode + real CSS custom-cursor application, nothing a jsdom unit test can prove
  expect(new Set([seCursor, eCursor, nCursor, neCursor]).size).toBe(4);
});

test('dragging a corner handle resizes the node while the opposite corner stays anchored', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-corner-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 450, 450);
  await designPage.click(375, 375);
  const beforeResize = await designPage.canvas.screenshot();

  await designPage.pointerDown(450, 450); // "se" handle
  await designPage.pointerMove(550, 550);
  await designPage.pointerUp();
  const afterResize = await designPage.canvas.screenshot();

  expect(afterResize.equals(beforeResize)).toBe(false);

  // the dragged handle now lives at the new bottom-right position...
  expect(await waitForResizeCursor(designPage, 550, 550)).not.toBe('');

  // ...while the opposite "nw" corner, never touched by the drag, is still exactly where it started
  expect(await waitForResizeCursor(designPage, 300, 300)).not.toBe('');
});

test('holding Shift while dragging a corner locks the aspect ratio, producing a different result than a free drag', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-resize-shift-lock-free');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 400, 350); // 100x50, a 2:1 rectangle
  await designPage.click(350, 325);

  await designPage.pointerDown(400, 350); // "se" handle
  await designPage.pointerMove(600, 400); // width grows far more than height — breaks the 2:1 ratio
  await designPage.pointerUp();
  const freeResize = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-resize-shift-lock-locked');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 400, 350);
  await designPage.click(350, 325);

  await page.keyboard.down('Shift');
  await designPage.pointerDown(400, 350);
  await designPage.pointerMove(600, 400); // identical drag, but the 2:1 ratio must be preserved
  await designPage.pointerUp();
  await page.keyboard.up('Shift');
  const lockedResize = await designPage.canvas.screenshot();

  expect(lockedResize.equals(freeResize)).toBe(false);
});
