import { Locator, Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// the frame's WebGL name label sits just above its top-left corner (world-space at a fresh
// project's default 1:1 viewport, same assumption existing draw specs already rely on)
const treeItemName = (page: Page): Locator => page.locator('[class*="TreeItem__name"]').first();

test('renaming a frame via its canvas label updates the Layers panel row', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-name-label-canvas-rename');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 780, 380);
  await expect(treeItemName(page)).toHaveText('Frame 1');

  await designPage.doubleClick(715, 288); // the auto-numbered "Frame 1" label, just above the frame
  await page.keyboard.type('Header');
  await page.keyboard.press('Enter');

  await expect(treeItemName(page)).toHaveText('Header');
});

test('renaming a frame from the Layers panel updates its canvas label', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-name-label-panel-rename');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 780, 380);

  const safeArea = await designPage.canvasSafeArea();
  const before = await page.screenshot({ clip: safeArea });

  await treeItemName(page).dblclick();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('Header');
  await page.keyboard.press('Enter');

  const after = await page.screenshot({ clip: safeArea });

  // the WebGL-drawn label text changed, so the two captures must differ
  expect(after.equals(before)).toBe(false);
});

test('pressing Escape while editing the canvas label leaves the name unchanged', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-name-label-escape');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 780, 380);
  await expect(treeItemName(page)).toHaveText('Frame 1');

  await designPage.doubleClick(715, 288);
  await page.keyboard.type('Discarded');
  await page.keyboard.press('Escape');

  await expect(treeItemName(page)).toHaveText('Frame 1');
});

test('the auto-numbered label is already visible above a frame while it is still being drawn', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-name-label-during-drag');
  await expect(designPage.canvas).toBeVisible();

  // a thin strip above the eventual top-left corner (700, 300) — where the label lands, above
  // where the draft rectangle itself starts — so this only ever captures label pixels
  const labelArea = { height: 20, width: 70, x: 690, y: 275 };
  const before = await page.screenshot({ clip: labelArea });

  await designPage.selectTool('frame');
  await designPage.pointerDown(700, 300);
  await page.mouse.move(780, 380, { steps: 5 });

  const duringDrag = await page.screenshot({ clip: labelArea });

  await designPage.pointerUp();

  // the "Frame 1" label must render as soon as the frame is being dragged out, before the pointer
  // is ever released
  expect(duringDrag.equals(before)).toBe(false);
});

test('Ctrl+Z after a canvas-label rename reverts the name', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-name-label-undo');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 780, 380);
  await expect(treeItemName(page)).toHaveText('Frame 1');

  await designPage.doubleClick(715, 288);
  await page.keyboard.type('Header');
  await page.keyboard.press('Enter');
  await expect(treeItemName(page)).toHaveText('Header');

  await page.keyboard.press('Control+z');

  await expect(treeItemName(page)).toHaveText('Frame 1');
});
