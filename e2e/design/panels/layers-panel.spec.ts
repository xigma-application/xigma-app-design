import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

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

  await page.locator('[data-tree-item-action="locked"]').click(); // lock the frame

  await designPage.click(720, 120); // click on the (still visible, now locked) frame

  const afterLockClick = await page.screenshot({ clip: safeArea });

  // the frame still renders, but the click must not select it — no selection outline appears
  expect(afterLockClick.equals(deselectedVisible)).toBe(true);
});

test('the collapse-all button and Alt+L both fold every expanded group in the Layers panel', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-panel-collapse-all');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(760, 100, 800, 140); // B — adjacent, auto-selected
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group-1 = [A, B]
  await page.keyboard.press('Control+g'); // group-2 = [group-1] — nesting is g2 > g1 > [A, B]
  await designPage.click(1500, 600); // deselect

  const layersPanel = page.locator('[class*="Layers_"]').first();
  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');
  const collapseAllButton = page.getByRole('button', { exact: true, name: 'Collapse layers' });

  // nothing expanded yet — no collapse-all button
  await expect(rows).toHaveCount(1);
  await expect(collapseAllButton).toHaveCount(0);

  // expand both nested groups
  await rows.nth(0).locator('[class*="TreeItem__toggleButton"]').click();
  await rows.nth(1).locator('[class*="TreeItem__toggleButton"]').click();
  await expect(rows).toHaveCount(4); // g2, g1, A, B

  // the collapse-all button appears; clicking it folds everything back
  await expect(collapseAllButton).toBeVisible();
  await collapseAllButton.click();
  await expect(rows).toHaveCount(1);
  await expect(collapseAllButton).toHaveCount(0);

  // re-expand, then collapse everything again with Alt+L while hovering the panel
  await rows.nth(0).locator('[class*="TreeItem__toggleButton"]').click();
  await rows.nth(1).locator('[class*="TreeItem__toggleButton"]').click();
  await expect(rows).toHaveCount(4);

  await layersPanel.hover();
  await page.keyboard.press('Alt+l');
  await expect(rows).toHaveCount(1);
});

test('right-clicking an unselected layer selects it and opens its own context menu', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-panel-context-menu-select');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A, row 0
  await designPage.drawRectangle(760, 100, 800, 140); // B, row 1 — drawn last, so it starts selected instead of A

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');
  const rowA = rows.nth(0);
  const rowB = rows.nth(1);

  await expect(rowA.locator('[aria-selected="true"]')).toHaveCount(0); // A starts unselected

  await rowA.click({ button: 'right' }); // no prior left-click on A at all

  // right-clicking replaced the selection, so the menu that opened acts on A, not the previously-selected B
  await expect(rowA.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(rowB.locator('[aria-selected="true"]')).toHaveCount(0);
  await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeVisible();
});

test('right-clicking a layer already part of a multi-selection keeps the whole selection intact', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-panel-context-menu-keep-multiselect');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A, row 0
  await designPage.drawRectangle(760, 100, 800, 140); // B, row 1 — drawn last, adjacent, auto-selected
  await designPage.click(720, 120, { shift: true }); // shift-click A on canvas, selection becomes [B, A]

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');
  const rowA = rows.nth(0);
  const rowB = rows.nth(1);

  await expect(rowA.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(rowB.locator('[aria-selected="true"]')).toHaveCount(1);

  await rowB.click({ button: 'right' }); // right-clicking a row already in the selection

  // the multi-selection survives, unlike right-clicking a row outside it
  await expect(rowA.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(rowB.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeVisible();
});

test('a layer name too long for the panel makes the Layers tree scroll horizontally', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-panel-horizontal-scroll');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140);

  const treeName = page.locator('[class*="TreeItem__name"]').first();

  await treeName.dblclick();
  await page.keyboard.type('This is a deliberately very long layer name that will never fit the panel width');
  await page.keyboard.press('Enter');

  const rowsContainer = page.locator('[class*="Tree__rows"]').first();

  // the content is now wider than the viewport, so the container has real horizontal scroll room
  const overflow = await rowsContainer.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeGreaterThan(0);

  // and scrolling it actually moves
  await rowsContainer.evaluate((el) => {
    el.scrollLeft = 40;
  });
  await expect(async () => {
    expect(await rowsContainer.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  }).toPass();

  // our horizontal scroll thumb shows while the panel is hovered
  await page.locator('[class*="Layers_"]').first().hover();
  await expect(page.locator('[class*="ScrollThumb--horizontal"]')).toBeVisible();
});
