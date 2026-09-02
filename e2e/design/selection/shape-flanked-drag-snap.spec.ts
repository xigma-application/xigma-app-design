import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('dragging a shape back between two flanking neighbours snaps it to the centred, equal-gap position, rendering identically to placing it there directly', async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-flanked-drag-snap-dragged');
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

  await control.goto('e2e-test-flanked-drag-snap-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 250, 780, 350);
  await control.drawRectangle(940, 250, 1020, 350);
  await control.drawRectangle(820, 250, 900, 350); // shape2 placed directly at the centred position
  await control.click(860, 300); // re-select shape2, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: { height: 350, width: 450, x: 650, y: 150 } });

  expect(snappedShot.equals(controlShot)).toBe(true);
});
