import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('dragging a resize handle within tolerance of another shape snaps the edge flush, rendering identically to placing it there directly', async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-shape-resize-snap-dragged');
  await expect(snapped.canvas).toBeVisible();

  await snapped.drawRectangle(700, 150, 800, 200); // A, 100x50
  await snapped.drawRectangle(823, 150, 923, 250); // B, 100x100, 23px right of A's un-resized edge
  await snapped.click(750, 175); // select A so its resize handles are live

  await snapped.pointerDown(800, 200); // A's "se" handle
  await page.mouse.move(820, 283, { steps: 4 }); // raw +23/+83 — A's right edge (820) lands 3px short of B's left edge (823)
  await snapped.pointerUp();
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await snapped.canvas.screenshot();

  const control = new DesignPage(page);

  await control.goto('e2e-test-shape-resize-snap-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 150, 800, 200); // A, same starting rect as the snapped scene
  await control.drawRectangle(823, 150, 923, 250); // B, same as above
  await control.click(750, 175);

  await control.pointerDown(800, 200); // A's "se" handle
  await page.mouse.move(823, 283, { steps: 4 }); // dragged exactly onto B's edge — same resize math path, no snap needed to land here
  await control.pointerUp();
  await control.pointerMove(1400, 800);

  const controlShot = await control.canvas.screenshot();

  expect(snappedShot.equals(controlShot)).toBe(true);
});
