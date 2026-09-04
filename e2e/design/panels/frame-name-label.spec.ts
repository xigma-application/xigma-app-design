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
  await expect(treeItemName(page)).toHaveText('Frame (1)');

  await designPage.doubleClick(715, 288); // the auto-numbered "Frame (1)" label, just above the frame
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
  await expect(treeItemName(page)).toHaveText('Frame (1)');

  await designPage.doubleClick(715, 288);
  await page.keyboard.type('Discarded');
  await page.keyboard.press('Escape');

  await expect(treeItemName(page)).toHaveText('Frame (1)');
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

  // the "Frame (1)" label must render as soon as the frame is being dragged out, before the pointer
  // is ever released
  expect(duringDrag.equals(before)).toBe(false);
});

test('Ctrl+Z after a canvas-label rename reverts the name', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-name-label-undo');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 780, 380);
  await expect(treeItemName(page)).toHaveText('Frame (1)');

  await designPage.doubleClick(715, 288);
  await page.keyboard.type('Header');
  await page.keyboard.press('Enter');
  await expect(treeItemName(page)).toHaveText('Header');

  await page.keyboard.press('Control+z');

  await expect(treeItemName(page)).toHaveText('Frame (1)');
});

test('clicking a frame’s canvas label selects it, the same as clicking its body', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-name-label-click-select');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 780, 380);
  await designPage.click(1500, 600); // deselect
  await designPage.pointerMove(1500, 700); // neutral resting point, avoids hover-outline artifacts
  const deselected = await designPage.canvas.screenshot();

  await designPage.click(715, 288); // the label, well above the frame's own body
  await designPage.pointerMove(1500, 700);
  const afterLabelClick = await designPage.canvas.screenshot();

  expect(afterLabelClick.equals(deselected)).toBe(false);

  // reference, in the same session — selecting the same frame by clicking its body instead must
  // land on pixel-identical output (comparing across a fresh navigation is flaky: WebGL/MSDF
  // rendering isn't guaranteed byte-identical between two separate page loads)
  await designPage.click(1500, 600); // deselect again
  await designPage.click(740, 340); // the frame's own body
  await designPage.pointerMove(1500, 700);
  const afterBodyClick = await designPage.canvas.screenshot();

  expect(afterLabelClick.equals(afterBodyClick)).toBe(true);
});

test('hovering a frame’s canvas label shows the hover highlight, the same as hovering its body', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-name-label-hover');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 780, 380);
  await designPage.click(1500, 600); // deselect, so only the hover outline is at play

  await designPage.pointerMove(1500, 700); // rest away first
  const baseline = await designPage.canvas.screenshot();

  await designPage.pointerMove(715, 288); // onto the label, without pressing
  const hovered = await designPage.canvas.screenshot();

  expect(hovered.equals(baseline)).toBe(false);

  await designPage.pointerMove(1500, 700); // move back off
  const afterLeaving = await designPage.canvas.screenshot();

  expect(afterLeaving.equals(baseline)).toBe(true);
});
