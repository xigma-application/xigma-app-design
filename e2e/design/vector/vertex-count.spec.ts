import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// utils
import { countMismatchedPixels } from '../../utils/compareScreenshots';

test.describe.configure({ mode: 'serial' });

test('the polygon vertex-count handle only renders once the triangle is both selected and hovered, not just selected', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-vertex-count-visibility');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawPolygon(900, 300, 1050, 450); // a 150x150 triangle, top vertex at (975, 300)
  await designPage.click(975, 375); // select it
  await designPage.pointerMove(1400, 700); // rest well away from the shape
  const selectedOnly = await designPage.canvas.screenshot();

  await designPage.pointerMove(975, 375); // move onto the shape itself
  const selectedAndHovered = await designPage.canvas.screenshot();

  expect(selectedAndHovered.equals(selectedOnly)).toBe(false);
});

test('dragging the polygon vertex-count handle toward the corner-radius handle vertex (straight up) increases sides', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-vertex-count-increase');
  await expect(designPage.canvas).toBeVisible();

  // a 150x150 triangle, box (900, 300) -> (1050, 450), center (975, 375); the default 3-sided
  // vertex-count handle (vertex index 1) sits at (1039.951905, 412.5)
  await designPage.drawPolygon(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(1040, 412.5); // hover the handle to reveal it
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(1040, 412.5); // grab the handle
  await designPage.pointerMove(1040, 305); // straight up, toward the top vertex — increases sides
  await designPage.pointerUp();
  await designPage.pointerMove(1040, 412.5); // return to compare against the same rest position
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false);
});

test('dragging the polygon vertex-count handle past the vertical axis through the center resets sides to the minimum', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-vertex-count-reset');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawPolygon(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(1040, 412.5);
  const originalMinState = await designPage.canvas.screenshot(); // sides already default to the minimum (3)

  await designPage.pointerDown(1040, 412.5); // grab the handle
  await designPage.pointerMove(1040, 305); // increase sides first
  const increasedState = await designPage.canvas.screenshot();

  await designPage.pointerMove(900, 375); // cross past the vertical axis through the center (x < 975)
  await designPage.pointerUp();
  await designPage.pointerMove(1040, 412.5); // back to the (now min-state) handle's resting spot
  const afterReset = await designPage.canvas.screenshot();

  // crossing the axis snapped sides back down to 3, reproducing the pre-drag shape exactly
  expect(increasedState.equals(originalMinState)).toBe(false);
  expect(afterReset.equals(originalMinState)).toBe(true);
});

test('the star vertex-count handle only renders once the star is both selected and hovered, not just selected', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-star-vertex-count-visibility');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawStar(900, 300, 1050, 450); // a 150x150 star, top vertex at (975, 300)
  await designPage.click(975, 375); // select it
  await designPage.pointerMove(1400, 700); // rest well away from the shape
  const selectedOnly = await designPage.canvas.screenshot();

  await designPage.pointerMove(975, 375); // move onto the shape itself
  const selectedAndHovered = await designPage.canvas.screenshot();

  expect(selectedAndHovered.equals(selectedOnly)).toBe(false);
});

test('dragging the star vertex-count handle toward the corner-radius handle vertex (straight up) increases points', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-star-vertex-count-increase');
  await expect(designPage.canvas).toBeVisible();

  // a 150x150 5-point star, box (900, 300) -> (1050, 450), center (975, 375); vertex index 2 (the
  // next spike's outer tip) sits at (1046.329239, 351.823725)
  await designPage.drawStar(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(1046.33, 351.82); // hover the handle to reveal it
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(1046.33, 351.82); // grab the handle
  await designPage.pointerMove(1046, 305); // straight up, toward the top vertex — increases points
  await designPage.pointerUp();
  await designPage.pointerMove(1046.33, 351.82); // return to compare against the same rest position
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false);
});

test('dragging the star vertex-count handle past the vertical axis through the center resets points to the same minimum regardless of the path taken to get there', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  // unlike Polygon (whose default sides already equals POLYGON_MIN_SIDES), a freshly-drawn star
  // defaults to 5 points, not STAR_MIN_POINTS (3) — so instead of comparing against the untouched
  // shape, this drags via two different intermediate paths and confirms both land on the identical
  // final (minimum-points) shape, the same "two independently-rendered runs must match" pattern the
  // corner-radius zoom-out test uses above
  const resetViaPath = async (projectId: string, increaseTarget: { x: number; y: number }): Promise<Buffer> => {
    await designPage.goto(projectId);
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawStar(900, 300, 1050, 450); // 150x150 star, box (900, 300) -> (1050, 450)
    await designPage.click(975, 375);
    await designPage.pointerMove(1046.33, 351.82); // hover the 5-point handle to reveal it

    await designPage.pointerDown(1046.33, 351.82); // grab the handle
    await designPage.pointerMove(increaseTarget.x, increaseTarget.y); // increase points along a different path
    await designPage.pointerMove(900, 375); // then cross past the vertical axis through the center — resets to the minimum
    await designPage.pointerUp();
    await designPage.pointerMove(1046.33, 351.82); // rest at the same spot for a like-for-like comparison

    return designPage.canvas.screenshot();
  };

  const viaHighIncrease = await resetViaPath('e2e-test-star-vertex-count-reset-a', { x: 1046, y: 305 });
  const viaLowIncrease = await resetViaPath('e2e-test-star-vertex-count-reset-b', { x: 1030, y: 360 });

  // tolerant compare: two independent WebGL renders of the identical reset shape can differ by a byte
  // or two of sub-pixel AA noise with zero visually different pixels, which a strict Buffer.equals trips on
  expect(countMismatchedPixels(viaHighIncrease, viaLowIncrease)).toBe(0);
});

test('dragging the star ratio handle toward its anchor rounds out the points, changing the shape', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-star-ratio-drag');
  await expect(designPage.canvas).toBeVisible();

  // a 150x150 5-point star, box (900, 300) -> (1050, 450), center (975, 375); at the default ratio
  // (0.382) the ratio handle (vertex index 1, between the tip and the next spike) sits at
  // (991.840047, 351.821663); its own fixed anchor (ratio 1, fully rounded out) sits at
  // (1019.083894, 314.323725)
  await designPage.drawStar(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(991.84, 351.82); // hover the handle to reveal it
  const beforeDrag = await designPage.canvas.screenshot();

  await designPage.pointerDown(991.84, 351.82); // grab the handle
  await designPage.pointerMove(1019.08, 314.32); // drag toward its own anchor — increases the ratio
  await designPage.pointerUp();
  await designPage.pointerMove(991.84, 351.82); // return to the same screen spot for comparison
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false);
});

test('the polygon vertex-count handle appears at its physically flipped position after a mirroring resize, not the unflipped one', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-polygon-vertex-count-flip');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawPolygon(900, 300, 1000, 400); // 100x100 triangle, box (900, 300) -> (1000, 400)
  await designPage.click(950, 350);

  await designPage.pointerDown(1000, 400); // "se" handle
  await designPage.pointerMove(800, 200); // crosses both anchors by exactly 100x100, flips both axes
  await designPage.pointerUp();
  // final box (800, 200) -> (900, 300); center (850, 250); vertex index 1's unflipped local position
  // is (893.301270, 275) — flipping both axes mirrors that to (806.698730, 225)

  await designPage.click(850, 250); // select it
  await designPage.pointerMove(1500, 900); // rest well away from the shape
  const restingAway = await designPage.canvas.screenshot();

  await designPage.pointerMove(806.7, 225); // hover the physically flipped handle position
  const hoveredAtFlippedPosition = await designPage.canvas.screenshot();

  expect(hoveredAtFlippedPosition.equals(restingAway)).toBe(false);
});

test('the star vertex-count handle appears at its physically flipped position after a mirroring resize, not the unflipped one', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-star-vertex-count-flip');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawStar(900, 300, 1000, 400); // 100x100 star, box (900, 300) -> (1000, 400)
  await designPage.click(950, 350);

  await designPage.pointerDown(1000, 400); // "se" handle
  await designPage.pointerMove(800, 200); // crosses both anchors by exactly 100x100, flips both axes
  await designPage.pointerUp();
  // final box (800, 200) -> (900, 300); center (850, 250); vertex index 2's unflipped local position
  // is (897.552826, 234.549150) — flipping both axes mirrors that to (802.447174, 265.450850)

  await designPage.click(850, 250); // select it
  await designPage.pointerMove(1500, 900); // rest well away from the shape
  const restingAway = await designPage.canvas.screenshot();

  await designPage.pointerMove(802.45, 265.45); // hover the physically flipped handle position
  const hoveredAtFlippedPosition = await designPage.canvas.screenshot();

  expect(hoveredAtFlippedPosition.equals(restingAway)).toBe(false);
});
