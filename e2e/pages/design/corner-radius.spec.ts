import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test.describe.configure({ mode: 'serial' });

test('corner-radius handles only render once the rectangle is both selected and hovered, not just selected', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-corner-radius-visibility');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 450);
  await designPage.click(975, 375); // select it
  await designPage.pointerMove(1400, 700); // rest well away from the shape
  const selectedOnly = await designPage.canvas.screenshot();

  await designPage.pointerMove(975, 375); // move onto the shape itself
  const selectedAndHovered = await designPage.canvas.screenshot();

  expect(selectedAndHovered.equals(selectedOnly)).toBe(false);
});

test('dragging the ne handle down to radius 0 keeps it tracking the pointer at the corner mid-drag, only snapping to the zero-state offset after release', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-corner-radius-zero-mid-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 450); // 150x150 square, ne corner at (1050, 300)
  await designPage.click(975, 375);
  await designPage.pointerMove(1020, 330); // hover the zero-state handle to reveal it
  const restingZeroState = await designPage.canvas.screenshot();

  await designPage.pointerDown(1020, 330); // grab the zero-state handle
  await designPage.pointerMove(1050, 300); // drag exactly onto the corner — radius hits 0 mid-drag
  const midDragAtCorner = await designPage.canvas.screenshot();

  // mid-drag, the handle must sit right on the corner, not snap back to the zero-state offset
  expect(midDragAtCorner.equals(restingZeroState)).toBe(false);

  await designPage.pointerUp();
  const afterRelease = await designPage.canvas.screenshot();

  // once released, the handle returns to the exact same zero-state offset position as before the drag
  expect(afterRelease.equals(restingZeroState)).toBe(true);
});

test('grabbing the zero-state handle without moving the pointer leaves it exactly where it was, instead of jumping to the corner on click alone', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-corner-radius-zero-no-move');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 450); // 150x150 square, ne corner at (1050, 300)
  await designPage.click(975, 375);
  await designPage.pointerMove(1020, 330); // hover the zero-state handle to reveal it
  const restingZeroState = await designPage.canvas.screenshot();

  await designPage.pointerDown(1020, 330); // grab it, but never move the pointer
  const justGrabbed = await designPage.canvas.screenshot();

  // grabbing alone (armed, but no real movement yet) must not relocate the handle
  expect(justGrabbed.equals(restingZeroState)).toBe(true);

  await designPage.pointerUp();
});

test('the handle hides itself once a small radius renders below the minimum screen gap while zoomed out, instead of overlapping the corner', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const zoomOutSteps = 8;

  // draws the same 400x400 square, drags its ne handle to a given target, then zooms out through
  // the identical deterministic step sequence from a fresh 100% zoom — two independent runs of this
  // (one per project id) land on the exact same final shape/viewport geometry, so a screenshot diff
  // between them isolates the handle's own presence instead of being confounded by the hover
  // outline (which renders regardless of whether the corner-radius handle itself is shown)
  const captureHoveredAtLowZoom = async (projectId: string, dragTarget: { x: number; y: number }): Promise<Buffer> => {
    await designPage.goto(projectId);
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(900, 300, 1300, 700); // ne corner at (1300, 300)
    await designPage.click(1100, 500);
    await designPage.pointerMove(1270, 330); // hover the zero-state handle to reveal it

    await designPage.pointerDown(1270, 330);
    await designPage.pointerMove(dragTarget.x, dragTarget.y);
    await designPage.pointerUp();

    // MIN_RADIUS_HANDLE_GAP_PX is 12; each wheel step multiplies zoom by ~0.92, so a 20px radius
    // drops below the gap after about 7 steps, while the 400x400 shape itself stays comfortably
    // above the 100px shape-size cutoff throughout
    for (let step = 0; step < zoomOutSteps; step += 1) {
      await designPage.zoomAt(1100, 500, 100);
    }

    await designPage.pointerMove(1100, 500); // re-hover after the viewport shifted under the cursor

    return designPage.canvas.screenshot();
  };

  const smallRadiusAtLowZoom = await captureHoveredAtLowZoom('e2e-test-corner-radius-hide-small', { x: 1280, y: 320 }); // cornerRadius 20
  const largeRadiusAtLowZoom = await captureHoveredAtLowZoom('e2e-test-corner-radius-hide-large', { x: 1150, y: 330 }); // cornerRadius 150

  // a big-enough radius still shows its handle at the same zoom where the tiny radius hid it
  expect(largeRadiusAtLowZoom.equals(smallRadiusAtLowZoom)).toBe(false);
});

test('dragging the ne handle purely left, with no diagonal movement, visibly rounds the corner', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-corner-radius-left-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 450); // a 150x150 square, "ne" corner at (1050, 300)
  await designPage.click(975, 375);
  await designPage.pointerMove(975, 340); // hover to reveal the handles
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(1020, 330); // the ne radius handle, offset in from its corner
  await designPage.pointerMove(900, 330); // purely left — y never changes
  await designPage.pointerUp();
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false);
});

test('dragging the ne handle purely down, with no diagonal movement, also visibly rounds the corner', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-corner-radius-down-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(975, 340);
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(1020, 330); // the ne radius handle
  await designPage.pointerMove(1020, 450); // purely down — x never changes
  await designPage.pointerUp();
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false);
});

test('the polygon corner-radius handle only renders once the triangle is both selected and hovered, not just selected', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-corner-radius-visibility');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawPolygon(900, 300, 1050, 450); // a 150x150 triangle, top vertex at (975, 300)
  await designPage.click(975, 375); // select it
  await designPage.pointerMove(1400, 700); // rest well away from the shape
  const selectedOnly = await designPage.canvas.screenshot();

  await designPage.pointerMove(975, 375); // move onto the shape itself
  const selectedAndHovered = await designPage.canvas.screenshot();

  expect(selectedAndHovered.equals(selectedOnly)).toBe(false);
});

test('dragging the polygon handle toward the center visibly rounds every corner', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-corner-radius-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawPolygon(900, 300, 1050, 450); // a 150x150 triangle, top vertex at (975, 300)
  await designPage.click(975, 375);
  await designPage.pointerMove(975, 340); // hover to reveal the handle
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(975, 330); // the zero-state handle, offset in from the top vertex
  await designPage.pointerMove(975, 360); // straight down, toward the center
  await designPage.pointerUp();
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false);
});

test('dragging the polygon handle past the center and back does not misbehave', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-corner-radius-overshoot');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawPolygon(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(975, 340);

  await designPage.pointerDown(975, 330); // the zero-state handle
  await designPage.pointerMove(975, 500); // well past the center, deep into clamp territory
  const atMax = await designPage.canvas.screenshot();

  await designPage.pointerMove(975, 330); // back up near the start, past the center on the way
  const backNearStart = await designPage.canvas.screenshot();

  await designPage.pointerUp();

  expect(backNearStart.equals(atMax)).toBe(false);
});

test('the star corner-radius handle only renders once the star is both selected and hovered, not just selected', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-star-corner-radius-visibility');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawStar(900, 300, 1050, 450); // a 150x150 star, top vertex at (975, 300)
  await designPage.click(975, 375); // select it
  await designPage.pointerMove(1400, 700); // rest well away from the shape
  const selectedOnly = await designPage.canvas.screenshot();

  await designPage.pointerMove(975, 375); // move onto the shape itself
  const selectedAndHovered = await designPage.canvas.screenshot();

  expect(selectedAndHovered.equals(selectedOnly)).toBe(false);
});

test('dragging the star handle toward the center visibly rounds both the outer tips and the inner points', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-star-corner-radius-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawStar(900, 300, 1050, 450); // a 150x150 star, top vertex at (975, 300)
  await designPage.click(975, 375);
  await designPage.pointerMove(975, 340); // hover to reveal the handle
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(975, 330); // the zero-state handle, offset in from the top vertex
  await designPage.pointerMove(975, 360); // straight down, toward the center
  await designPage.pointerUp();
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false);
});

test('dragging the star handle past the center and back does not misbehave', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-star-corner-radius-overshoot');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawStar(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(975, 340);

  await designPage.pointerDown(975, 330); // the zero-state handle
  await designPage.pointerMove(975, 500); // well past the center, deep into clamp territory
  const atMax = await designPage.canvas.screenshot();

  await designPage.pointerMove(975, 330); // back up near the start, past the center on the way
  const backNearStart = await designPage.canvas.screenshot();

  await designPage.pointerUp();

  expect(backNearStart.equals(atMax)).toBe(false);
});
