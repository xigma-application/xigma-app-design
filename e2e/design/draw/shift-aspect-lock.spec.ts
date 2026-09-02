import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('holding Shift while dragging a new rectangle locks it to a 1:1 square, producing a different result than a free drag', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-lock-shape-free');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('rectangle');
  await designPage.pointerDown(900, 300);
  await designPage.pointerMove(1100, 350); // 200x50 — nowhere near square
  await designPage.pointerUp();
  const freeDraw = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-shift-lock-shape-locked');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('rectangle');
  await page.keyboard.down('Shift');
  await designPage.pointerDown(900, 300);
  await designPage.pointerMove(1100, 350); // identical drag, but Shift forces a 200x200 square
  await designPage.pointerUp();
  await page.keyboard.up('Shift');
  const lockedDraw = await designPage.canvas.screenshot();

  expect(lockedDraw.equals(freeDraw)).toBe(false);
});

test('shows a blue dashed diagonal guide across the draft while Shift is held, and it disappears the instant Shift is released', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-lock-guide');
  await expect(designPage.canvas).toBeVisible();

  // the drag itself is already a perfect 150x150 square, so Shift's own aspect-lock never changes
  // the drafted rect's geometry here — isolating the guide overlay as the only possible difference
  // between these screenshots (rather than also the rect shape, which the next test covers)
  await designPage.selectTool('rectangle');
  await designPage.pointerDown(900, 300);
  await designPage.pointerMove(1050, 450);
  const withoutGuide = await designPage.canvas.screenshot();

  await page.keyboard.down('Shift');
  await designPage.pointerMove(1050, 451);
  await designPage.pointerMove(1050, 450);
  const withGuide = await designPage.canvas.screenshot();

  expect(withGuide.equals(withoutGuide)).toBe(false);

  await page.keyboard.up('Shift');
  await designPage.pointerMove(1050, 451);
  await designPage.pointerMove(1050, 450);
  const afterRelease = await designPage.canvas.screenshot();

  await designPage.pointerUp();

  expect(afterRelease.equals(withGuide)).toBe(false);
  expect(afterRelease.equals(withoutGuide)).toBe(true);
});

test('toggling Shift mid-drag toggles the lock live — releasing it returns to a free-form drag, holding it again re-locks', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shift-lock-toggle-mid-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('rectangle');
  await designPage.pointerDown(900, 300);

  await page.keyboard.down('Shift');
  await designPage.pointerMove(1100, 350); // locked to a 200x200 square while Shift is held
  const locked = await designPage.canvas.screenshot();

  await page.keyboard.up('Shift');
  await designPage.pointerMove(1100, 351); // released — back to a free 200x51 rect
  const releasedFree = await designPage.canvas.screenshot();

  await page.keyboard.down('Shift');
  await designPage.pointerMove(1100, 350); // held again — locks back to the square
  const relocked = await designPage.canvas.screenshot();

  await designPage.pointerUp();
  await page.keyboard.up('Shift');

  expect(releasedFree.equals(locked)).toBe(false);
  expect(relocked.equals(releasedFree)).toBe(false);
});
