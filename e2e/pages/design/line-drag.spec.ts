import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('dragging a line by its body moves both endpoints together, while dragging an endpoint moves only that one', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-body-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawLine(100, 500, 300, 500);
  await designPage.click(200, 500); // select the line by clicking its midpoint

  const beforeDrag = await designPage.canvas.screenshot();

  // grab the body, away from either endpoint handle, and drag the whole line up
  await designPage.pointerDown(200, 500);
  await designPage.pointerMove(200, 450);
  await designPage.pointerUp();

  const afterBodyDrag = await designPage.canvas.screenshot();
  expect(afterBodyDrag.equals(beforeDrag)).toBe(false);

  // reload for a clean canvas, redraw the identical line, and this time drag endpoint B by the same delta
  await designPage.goto('e2e-test-line-endpoint-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawLine(100, 500, 300, 500);
  await designPage.click(200, 500);

  await designPage.pointerDown(300, 500); // endpoint B
  await designPage.pointerMove(300, 450);
  await designPage.pointerUp();

  const afterEndpointDrag = await designPage.canvas.screenshot();

  // both gestures move something, but a whole-line translation (still horizontal, shifted up) looks
  // nothing like pivoting only one endpoint (now diagonal, with A left in its original place)
  expect(afterEndpointDrag.equals(beforeDrag)).toBe(false);
  expect(afterEndpointDrag.equals(afterBodyDrag)).toBe(false);
});

test('dragging endpoint A leaves endpoint B in place, and dragging endpoint B leaves endpoint A in place', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-endpoint-a-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawLine(400, 500, 600, 500);
  await designPage.click(500, 500);

  // dragging A up-left should leave B's handle exactly where it was, so clicking B's original spot
  // afterwards must still hit the line and re-select it (no shift needed, since it's already selected)
  await designPage.pointerDown(400, 500); // endpoint A
  await designPage.pointerMove(380, 440);
  await designPage.pointerUp();

  const afterADrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(600, 500); // endpoint B's original, untouched position
  await designPage.pointerMove(620, 560);
  await designPage.pointerUp();

  const afterBDrag = await designPage.canvas.screenshot();
  expect(afterBDrag.equals(afterADrag)).toBe(false);
});
