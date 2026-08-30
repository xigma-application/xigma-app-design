import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('dragging a shape within tolerance of another snaps its position flush, rendering identically to placing it there directly', async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-shape-alignment-snap-dragged');
  await expect(snapped.canvas).toBeVisible();

  await snapped.drawRectangle(700, 150, 800, 250); // A, 100x100
  await snapped.drawRectangle(823, 150, 923, 250); // B, 100x100, 23px right of A's un-dragged position

  await snapped.pointerDown(750, 200); // A's centre
  await page.mouse.move(770, 200, { steps: 4 }); // raw +20px — A's right edge (820) lands 3px short of B's left edge (823)
  await snapped.pointerUp();
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await snapped.canvas.screenshot();

  const control = new DesignPage(page);

  await control.goto('e2e-test-shape-alignment-snap-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(723, 150, 823, 250); // A placed directly at the snapped (+23px) position
  await control.drawRectangle(823, 150, 923, 250); // B, same as above
  await control.click(773, 200); // re-select A, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await control.canvas.screenshot();

  expect(snappedShot.equals(controlShot)).toBe(true);
});

test('dragging a shape well outside tolerance of another does not snap it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-alignment-snap-no-match');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 150, 800, 250); // A, 100x100
  await designPage.drawRectangle(1000, 150, 1100, 250); // B, 200px away — never within tolerance

  await designPage.pointerDown(750, 200); // A's centre
  await page.mouse.move(770, 200, { steps: 4 }); // raw +20px, nowhere near B
  await designPage.pointerUp();
  await designPage.pointerMove(1400, 800);

  const draggedShot = await designPage.canvas.screenshot();

  const control = new DesignPage(page);

  await control.goto('e2e-test-shape-alignment-snap-no-match-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(720, 150, 820, 250); // A placed directly at the raw (unsnapped) +20px position
  await control.drawRectangle(1000, 150, 1100, 250); // B, same as above
  await control.click(770, 200); // re-select A, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await control.canvas.screenshot();

  expect(draggedShot.equals(controlShot)).toBe(true);
});
