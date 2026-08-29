import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

// canvas.screenshot() captures the canvas element's full bounding box, which visually includes the
// opaque LeftPanel overlay drawn on top of it — expanding/collapsing the Layers panel changes those
// pixels for reasons unrelated to what these tests check, so every capture here is clipped to
// canvasSafeArea() instead, the region actually clear of both side panels

test('hiding a layer from the panel makes it invisible and un-clickable on canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-panel-hide');
  await expect(designPage.canvas).toBeVisible();

  const safeArea = await designPage.canvasSafeArea();
  const emptyCanvas = await page.screenshot({ clip: safeArea });

  await designPage.drawFrame(700, 100, 740, 140);
  await designPage.click(1500, 600); // deselect

  await page.locator('[class*="Layers__header"]').click(); // expand the Layers panel
  await page.locator('[data-tree-item-action="hidden"]').click(); // hide the frame

  await designPage.click(720, 120); // click where the (now hidden) frame used to be

  const afterHideClick = await page.screenshot({ clip: safeArea });

  // the frame no longer renders and can no longer be hit-tested — clicking its former spot leaves
  // the canvas looking exactly like it did before the frame was ever drawn
  expect(afterHideClick.equals(emptyCanvas)).toBe(true);
});

test('locking a layer from the panel keeps it visible but un-clickable on canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-panel-lock');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140);
  await designPage.click(1500, 600); // deselect

  const safeArea = await designPage.canvasSafeArea();
  const deselectedVisible = await page.screenshot({ clip: safeArea });

  await page.locator('[class*="Layers__header"]').click(); // expand the Layers panel
  await page.locator('[data-tree-item-action="locked"]').click(); // lock the frame

  await designPage.click(720, 120); // click on the (still visible, now locked) frame

  const afterLockClick = await page.screenshot({ clip: safeArea });

  // the frame still renders, but the click must not select it — no selection outline appears
  expect(afterLockClick.equals(deselectedVisible)).toBe(true);
});
