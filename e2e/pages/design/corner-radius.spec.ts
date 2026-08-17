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
