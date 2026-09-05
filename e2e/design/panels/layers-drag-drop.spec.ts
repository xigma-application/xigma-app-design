import { test, expect, Locator } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// drags the vertical centre of one Layers row onto the vertical centre of another, in small steps so
// the tree's drag threshold and hit-testing both engage; leaves the mouse held down when `hold` is set
const dragRowOnto = async (from: Locator, to: Locator, options: { hold?: boolean } = {}): Promise<void> => {
  const fromBox = await from.boundingBox();
  const toBox = await to.boundingBox();

  if (!fromBox || !toBox) {
    throw new Error('row bounding box unavailable');
  }

  const page = from.page();

  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });

  if (!options.hold) {
    await page.mouse.up();
  }
};

test('dropping a layer onto the middle of a collapsed group nests it as the first child', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-drop-into-group');
  await expect(designPage.canvas).toBeVisible();

  // A + B, grouped; then a loose rectangle C on top
  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(760, 100, 800, 140); // B — adjacent, auto-selected
  await designPage.click(720, 120, { shift: true }); // selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], collapsed
  await designPage.drawRectangle(820, 100, 860, 140); // C — loose, at the root
  await designPage.click(1500, 600); // deselect

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  // root shows the group and the loose rectangle
  await expect(rows).toHaveCount(2);

  const groupRow = rows.filter({ hasText: 'Group' });
  const rectRow = rows.filter({ hasText: 'Rectangle' }).last();

  await dragRowOnto(rectRow, groupRow);

  // C left the root — only the group remains there
  await expect(rows).toHaveCount(1);

  // expanding the group reveals C sitting above the original members
  await rows.nth(0).locator('[class*="TreeItem__toggleButton"]').click();
  await expect(rows).toHaveCount(4);
});

test('dropping a layer onto the middle of an already-expanded group also nests it as the first child', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-drop-into-expanded-group');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(760, 100, 800, 140); // B
  await designPage.click(720, 120, { shift: true }); // selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B]
  await designPage.drawRectangle(820, 100, 860, 140); // C — loose
  await designPage.click(1500, 600); // deselect

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await expect(rows).toHaveCount(2);

  // C is the front-most root node, so it stays at row 0 even after the group below it expands —
  // rows become [C, group, B, A]
  const rectC = rows.nth(0);

  await rows.filter({ hasText: 'Group' }).locator('[class*="TreeItem__toggleButton"]').click();
  await expect(rows).toHaveCount(4);

  await dragRowOnto(rectC, rows.filter({ hasText: 'Group' }));

  // the group still holds 4 rows (group + 3 children) and C is no longer a root row —
  // collapsing the group now folds C away too
  await expect(rows).toHaveCount(4);
  await rows.filter({ hasText: 'Group' }).locator('[class*="TreeItem__toggleButton"]').click();
  await expect(rows).toHaveCount(1);
});

test('holding a drag over a collapsed group auto-expands it after the spring-load delay', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-spring-load');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(760, 100, 800, 140); // B
  await designPage.click(720, 120, { shift: true });
  await page.keyboard.press('Control+g'); // group = [A, B], collapsed
  await designPage.drawRectangle(820, 100, 860, 140); // C — loose
  await designPage.click(1500, 600); // deselect

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await expect(rows).toHaveCount(2);

  const groupRow = rows.filter({ hasText: 'Group' });
  const rectRow = rows.filter({ hasText: 'Rectangle' }).last();

  // hold the drag motionless over the collapsed group
  await dragRowOnto(rectRow, groupRow, { hold: true });
  await page.waitForTimeout(3300);

  // the group opened on its own while the pointer is still held down
  await expect(rows).toHaveCount(4);

  // releasing right there still drops the layer into the now-open group
  await page.mouse.up();
  await expect(rows).toHaveCount(4);
  await rows.filter({ hasText: 'Group' }).locator('[class*="TreeItem__toggleButton"]').click();
  await expect(rows).toHaveCount(1);
});

test('dragging a Layers row onto a sibling row reorders them, using the auto-layout frame’s own forward (non-reversed) row order', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-layers-autolayout-row-reorder');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 900, 400);
  await page.locator('[data-test-toggle-button-group="flow"]').getByLabel('Vertical', { exact: true }).click();

  // two rectangles dragged into the (empty) frame, settling top-to-bottom as childIds [rectA, rectB]
  await designPage.drawRectangle(1000, 100, 1040, 140);
  await page.mouse.move(1020, 120);
  await page.mouse.down();
  await page.mouse.move(750, 250, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();

  await designPage.drawRectangle(1000, 200, 1040, 240);
  await page.mouse.move(1020, 220);
  await page.mouse.down();
  await page.mouse.move(750, 250, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  // expand the frame row if the drag-in didn't already reveal its children
  if ((await rows.count()) === 1) {
    await rows.filter({ hasText: 'Frame' }).locator('[class*="TreeItem__toggleButton"]').click();
  }

  await expect(rows).toHaveCount(3);

  // forward order: the frame's own children list top-to-bottom matching the visual layout, so
  // rows[1] is the topmost child (rectA) and rows[2] the bottommost (rectB)
  const before = await rows.allInnerTexts();

  // drag the bottom child (rectB, row 2) onto the TOP edge of the top child's row (rectA, row 1),
  // signalling "insert before rectA" rather than "insert after it" (which would land rectB right
  // back in its own original slot — a no-op, not a genuine reorder). A real reproduction of the
  // reported bug: this used to be a no-op for an auto-layout frame regardless of drop position,
  // because the write-side index math still assumed every container's Layers rows were reversed
  // relative to childIds
  const fromRow = rows.nth(2);
  const toRow = rows.nth(1);
  const fromBox = await fromRow.boundingBox();
  const toBox = await toRow.boundingBox();

  if (!fromBox || !toBox) {
    throw new Error('row bounding box unavailable');
  }

  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + 2, { steps: 10 });
  await page.mouse.up();

  const after = await rows.allInnerTexts();

  expect(after).toEqual([before[0], before[2], before[1]]);
});
