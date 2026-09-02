import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test("dragging a shape near its neighbour's own established gap to a third shape snaps to match it, rendering identically to placing it there directly", async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-guide-smart-chain-gap-dragged');
  await expect(snapped.canvas).toBeVisible();

  // square1 (60x60) and square2 (100x100) sit with a 30px gap; square3 (40x40) starts 2px past the
  // x:920 that would give it the same 30px gap to square2
  await snapped.drawRectangle(700, 300, 760, 360);
  await snapped.drawRectangle(790, 250, 890, 350);
  await snapped.drawRectangle(922, 305, 962, 345);

  await snapped.pointerDown(942, 325); // square3's centre
  await page.mouse.move(943, 325, { steps: 3 }); // raw +1px — the snap closes the remaining mismatch
  await snapped.pointerUp();
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await page.screenshot({ clip: { height: 250, width: 400, x: 650, y: 200 } });

  const control = new DesignPage(page);

  await control.goto('e2e-test-guide-smart-chain-gap-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 300, 760, 360);
  await control.drawRectangle(790, 250, 890, 350);
  await control.drawRectangle(920, 305, 960, 345); // square3 placed directly at the snapped (matching-gap) position
  await control.click(940, 325); // re-select square3, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: { height: 250, width: 400, x: 650, y: 200 } });

  expect(snappedShot.equals(controlShot)).toBe(true);
});

test('dragging a shape well outside tolerance of a matching gap does not snap it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-guide-smart-chain-gap-no-match');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 760, 360);
  await designPage.drawRectangle(790, 250, 890, 350);
  await designPage.drawRectangle(922, 305, 962, 345);

  await designPage.pointerDown(942, 325); // square3's centre
  await page.mouse.move(972, 325, { steps: 3 }); // raw +30px, well outside the snap tolerance
  await designPage.pointerUp();
  await designPage.pointerMove(1400, 800);

  const draggedShot = await page.screenshot({ clip: { height: 250, width: 400, x: 650, y: 200 } });

  const control = new DesignPage(page);

  await control.goto('e2e-test-guide-smart-chain-gap-no-match-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 300, 760, 360);
  await control.drawRectangle(790, 250, 890, 350);
  await control.drawRectangle(952, 305, 992, 345); // square3 placed directly at the raw (unsnapped) +30px position
  await control.click(972, 325); // re-select square3, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: { height: 250, width: 400, x: 650, y: 200 } });

  expect(draggedShot.equals(controlShot)).toBe(true);
});

test('dragging a shape back between two flanking neighbours snaps it to the centred, equal-gap position, rendering identically to placing it there directly', async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-guide-smart-flanked-dragged');
  await expect(snapped.canvas).toBeVisible();

  // shape1 (80x100) and shape3 (80x100) leave a 120px span for shape2 (80x100) — a centred 20px gap
  // on each side
  await snapped.drawRectangle(700, 250, 780, 350);
  await snapped.drawRectangle(820, 250, 900, 350);
  await snapped.drawRectangle(940, 250, 1020, 350);

  await snapped.pointerDown(860, 300); // shape2's centre
  await page.mouse.move(860, 500, { steps: 5 }); // drag it away first
  await snapped.pointerUp();

  await snapped.pointerDown(860, 500);
  await page.mouse.move(862, 302, { steps: 5 }); // back toward the middle, 2px off centred
  await snapped.pointerUp();
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await page.screenshot({ clip: { height: 350, width: 450, x: 650, y: 150 } });

  const control = new DesignPage(page);

  await control.goto('e2e-test-guide-smart-flanked-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 250, 780, 350);
  await control.drawRectangle(940, 250, 1020, 350);
  await control.drawRectangle(820, 250, 900, 350); // shape2 placed directly at the centred position
  await control.click(860, 300); // re-select shape2, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: { height: 350, width: 450, x: 650, y: 150 } });

  expect(snappedShot.equals(controlShot)).toBe(true);
});
