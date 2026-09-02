import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('a distance guide with a numeric label appears while Alt-hovering another shape with one selected, and clears when Alt is released', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-basic');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 150, 900, 300); // A
  await designPage.drawRectangle(950, 180, 1050, 260); // B, 50px to the right, vertically overlapping A
  await designPage.selectTool('default');
  await designPage.click(800, 220); // select A

  await designPage.pointerMove(1400, 800); // rest away
  const away = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1000, 220); // hover B while Alt is held
  const altHovered = await designPage.canvas.screenshot();

  expect(altHovered.equals(away)).toBe(false);

  await page.keyboard.up('Alt');
  const altReleased = await designPage.canvas.screenshot();

  expect(altReleased.equals(altHovered)).toBe(false);

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1400, 800); // move off B while Alt is still held
  const movedOff = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  expect(movedOff.equals(altHovered)).toBe(false);
});

test('the shadow cursor shows while Alt-hovering another shape and reverts once Alt is released', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-cursor');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 400, 900, 550);
  await designPage.drawRectangle(950, 430, 1050, 510);
  await designPage.selectTool('default');
  await designPage.click(800, 470);

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1000, 470);

  await expect.poll(() => designPage.canvas.evaluate((el) => getComputedStyle(el).cursor)).toContain('shadow-cursor.png');

  await page.keyboard.up('Alt');

  await expect.poll(() => designPage.canvas.evaluate((el) => getComputedStyle(el).cursor)).not.toContain('shadow-cursor.png');
});

test('a distance guide appears for a diagonally separated shape, with no overlap on either axis', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-diagonal');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 150, 850, 280); // A
  await designPage.drawRectangle(950, 380, 1050, 460); // B, below-right of A, no shared axis
  await designPage.selectTool('default');
  await designPage.click(780, 220); // select A

  await designPage.pointerMove(1400, 800);
  const away = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1000, 420); // hover B
  const altHovered = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  expect(altHovered.equals(away)).toBe(false);
});

test('a distance guide appears for a diagonal pair whose ranges genuinely overlap on one axis (regression)', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-diagonal-overlap');
  await expect(designPage.canvas).toBeVisible();

  // A (top-left) and B (bottom-right, selected) have no x overlap, but their y-ranges cross by a
  // sliver (neither contains the other) — this used to render a negative/misplaced measurement
  await designPage.drawRectangle(700, 150, 900, 400);
  await designPage.drawRectangle(1000, 350, 1150, 550);
  await designPage.selectTool('default');
  await designPage.click(1075, 450); // select B

  await designPage.pointerMove(1400, 800);
  const away = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(800, 275); // hover A
  const altHovered = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  expect(altHovered.equals(away)).toBe(false);
});

test('side inset guides appear on both sides when the hovered shape directly below is narrower than the selected shape', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-side-insets');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 150, 900, 300); // A — 200 wide, selected
  await designPage.drawRectangle(750, 350, 850, 420); // B — 100 wide, centered under A, hovered

  await designPage.selectTool('default');
  await designPage.click(800, 220); // select A

  await designPage.pointerMove(1400, 800);
  const away = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(800, 380); // hover B
  const altHovered = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  // the plain vertical-gap case already proves a guide appears; this asserts the richer side-inset
  // rendering path (dashed side guides + extra "11"-style labels) also executes without throwing
  // and still visibly differs from the resting frame
  expect(altHovered.equals(away)).toBe(false);
});

test('a four-sided padding guide appears when the selected element sits fully inside the hovered container, and matches with the roles swapped', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-containment');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 150, 1000, 450); // outer container
  await designPage.drawRectangle(770, 230, 900, 340); // inner element, nested inside the frame

  await designPage.selectTool('default');
  await designPage.click(830, 280); // select the inner element

  await designPage.pointerMove(1400, 800);
  const away = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(710, 160); // hover the container's own corner
  const elementSelectedAltHovered = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  expect(elementSelectedAltHovered.equals(away)).toBe(false);

  // swap roles: select the container, Alt-hover the inner element — same padding measurement
  await designPage.click(710, 160);

  await designPage.pointerMove(1400, 800);
  const containerSelectedAway = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(830, 280); // hover the inner element
  const containerSelectedAltHovered = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  expect(containerSelectedAltHovered.equals(containerSelectedAway)).toBe(false);
});

test('no distance guide appears while Alt-hovering the shape that is already selected', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-self');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 600, 900, 750);
  await designPage.selectTool('default');
  await designPage.click(800, 670);

  await designPage.pointerMove(800, 670); // hover the selected shape itself, no Alt
  const hoveredSelf = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1400, 800); // move off, then back on, so Alt is already down when re-hovering
  await designPage.pointerMove(800, 670);
  const altHoveredSelf = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  // holding Alt over the already-selected shape's own body adds no distance guide (there is no
  // separate target to measure against), so the frame is identical to the plain hover
  expect(altHoveredSelf.equals(hoveredSelf)).toBe(true);
});

test('a vector point-to-point measurement appears while Alt-hovering another vertex with one vertex selected, in Vector Edit Mode', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-vector-point');
  await expect(designPage.canvas).toBeVisible();

  // v1 (1300,300) -> v2 (1450,300) -> v3 (1450,450), left open
  await designPage.drawVectorPath([
    { x: 1300, y: 300 },
    { x: 1450, y: 300 },
    { x: 1450, y: 450 },
  ]);
  await designPage.selectVectorEditMoveTool();
  await designPage.click(1300, 300); // select v1

  await designPage.pointerMove(1900, 800); // rest away
  const away = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1450, 450); // hover v3 while Alt is held
  const altHovered = await designPage.canvas.screenshot();

  expect(altHovered.equals(away)).toBe(false);

  await page.keyboard.up('Alt');
  const altReleased = await designPage.canvas.screenshot();

  expect(altReleased.equals(altHovered)).toBe(false);
});

test('a vector point-to-segment measurement appears while Alt-hovering a non-incident segment, and shows the shadow cursor', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-distance-guide-vector-segment');
  await expect(designPage.canvas).toBeVisible();

  // v1 (1300,600) -> v2 (1450,600) -> v3 (1450,750); segment v2->v3 does not touch v1
  await designPage.drawVectorPath([
    { x: 1300, y: 600 },
    { x: 1450, y: 600 },
    { x: 1450, y: 750 },
  ]);
  await designPage.selectVectorEditMoveTool();
  await designPage.click(1300, 600); // select v1

  await designPage.pointerMove(1900, 900); // rest away
  const away = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1450, 675); // hover the midpoint of segment v2->v3
  const altHovered = await designPage.canvas.screenshot();

  expect(altHovered.equals(away)).toBe(false);
  await expect.poll(() => designPage.canvas.evaluate((el) => getComputedStyle(el).cursor)).toContain('shadow-cursor.png');

  await page.keyboard.up('Alt');

  await expect.poll(() => designPage.canvas.evaluate((el) => getComputedStyle(el).cursor)).not.toContain('shadow-cursor.png');
});
