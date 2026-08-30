import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// two screenshot-equality tests sharing a page across workers is flaky under GPU/WebGL contention
// (see resize.spec.ts's own serial mode for the same reason) — pin this file to one worker
test.describe.configure({ mode: 'serial' });

// clipped to just the drawn shapes (page.screenshot({ clip }), the same technique resize.spec.ts's
// own mirror tests use) rather than the full canvas.screenshot() — a full-canvas capture picks up an
// unrelated 1-3px antialiasing wobble near the toolbar corner that has nothing to do with either shape
const SHAPE_REGION = { height: 200, width: 470, x: 670, y: 100 };

test('dragging a new rectangle within tolerance of an existing shape snaps its edge flush, rendering identically to drawing it there directly', async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-shape-draw-snap-dragged');
  await expect(snapped.canvas).toBeVisible();

  await snapped.drawRectangle(823, 150, 923, 250); // B, 100x100
  await snapped.drawRectangle(700, 150, 820, 250); // A, raw right edge (820) lands 3px short of B's left edge (823)
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await page.screenshot({ clip: SHAPE_REGION });

  const control = new DesignPage(page);

  await control.goto('e2e-test-shape-draw-snap-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(823, 150, 923, 250); // B, same as above
  await control.drawRectangle(700, 150, 823, 250); // A drawn directly at the snapped (123x100) size
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: SHAPE_REGION });

  expect(snappedShot.equals(controlShot)).toBe(true);
});

test('dragging a new rectangle well outside tolerance of an existing shape does not snap it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-draw-snap-no-match');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(1000, 150, 1100, 250); // B, 200px away — never within tolerance
  await designPage.drawRectangle(700, 150, 800, 250); // A, raw 100x100
  await designPage.pointerMove(1400, 800);

  const drawnShot = await page.screenshot({ clip: SHAPE_REGION });

  const control = new DesignPage(page);

  await control.goto('e2e-test-shape-draw-snap-no-match-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(1000, 150, 1100, 250); // B, same as above
  await control.drawRectangle(700, 150, 800, 250); // A, same raw size as above — untouched by snap
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: SHAPE_REGION });

  expect(drawnShot.equals(controlShot)).toBe(true);
});
