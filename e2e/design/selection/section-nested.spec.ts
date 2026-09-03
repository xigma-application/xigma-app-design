import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// each test drives real pointer gestures plus Layers-panel drags, all timing sensitive (see the
// settle waits below) — running this file alongside three other heavy WebGL browser instances under
// the default parallel workers reliably starves them of CPU, so this file always runs its own tests
// one at a time
test.describe.configure({ mode: 'serial' });

const EMPTY_POINT = { x: 1650, y: 950 };

// drags the vertical centre of one Layers row onto the vertical centre of another (mirrors
// panels/layers-drag-drop.spec.ts's own helper); reparenting this way never moves a node's x/y, so
// everything drawn "inside" a section's bounds up front stays exactly where it is once nested
const dragRowOnto = async (from: Locator, to: Locator): Promise<void> => {
  const fromBox = await from.boundingBox();
  const toBox = await to.boundingBox();

  if (!fromBox || !toBox) {
    throw new Error('row bounding box unavailable');
  }

  const page = from.page();

  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });
  // the drop-inside indicator is computed from the mousemove and needs a moment to settle before the
  // mouseup, or the drop can resolve as a reorder instead of nesting inside the target
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const rowsOf = (page: Page): Locator => page.locator('[class*="LayersTree"]').first().locator('[class*="Tree__row_"]');

// a section drawn first, then a single rectangle drawn on top inside its bounds (so the rectangle is
// grabbable), then the rectangle reparented into the section via the Layers panel
const buildSectionWithRect = async (designPage: DesignPage, page: Page): Promise<void> => {
  await designPage.drawSection(600, 100, 1400, 750);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawRectangle(700, 200, 850, 350);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  const rows = rowsOf(page);
  const sectionRow = rows.filter({ hasText: 'Section 1' });

  await dragRowOnto(rows.filter({ hasText: 'Rectangle' }), sectionRow);
  await sectionRow.locator('[class*="TreeItem__toggleButton"]').click(); // reveal the nested rectangle's row
};

test('a plain click always selects the section itself, even over its own content — a section is never click-through', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-nested-plain-click');
  await expect(designPage.canvas).toBeVisible();
  await buildSectionWithRect(designPage, page);

  const rows = rowsOf(page);
  const sectionRow = rows.filter({ hasText: 'Section 1' });
  const rectRow = rows.filter({ hasText: 'Rectangle' });

  // clicking the section's own empty body selects the section
  await designPage.click(650, 700);
  await expect(sectionRow.locator('[aria-selected="true"]')).toHaveCount(1);

  // a plain click directly on the rectangle still resolves to the section, not the rectangle —
  // unlike a top-level frame, a section is always opaque
  await designPage.click(775, 275);
  await expect(sectionRow.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(rectRow.locator('[aria-selected="true"]')).toHaveCount(0);

  // Ctrl+click on that same point reaches the rectangle directly
  await designPage.click(775, 275, { ctrl: true });
  await expect(rectRow.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(sectionRow.locator('[aria-selected="true"]')).toHaveCount(0);
});

test('hover matches click over a section’s content, and Control reaches the same content it would select', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-nested-hover');
  await expect(designPage.canvas).toBeVisible();
  await buildSectionWithRect(designPage, page);

  const safeArea = await designPage.canvasSafeArea();

  // hovering the section's own empty body, and hovering the rectangle inside it without Control,
  // both resolve to the same node (the section) — the highlight must look identical either way
  await page.mouse.move(650, 700);
  const hoverSectionBody = await page.screenshot({ clip: safeArea });

  await page.mouse.move(775, 275);
  const hoverRectNoCtrl = await page.screenshot({ clip: safeArea });

  expect(hoverRectNoCtrl.equals(hoverSectionBody)).toBe(true);

  // holding Control over the rectangle instead highlights the rectangle itself — a different result
  await page.keyboard.down('Control');
  await page.mouse.move(776, 276); // force a fresh move event
  await page.mouse.move(775, 275);
  const hoverRectCtrl = await page.screenshot({ clip: safeArea });
  await page.keyboard.up('Control');

  expect(hoverRectCtrl.equals(hoverRectNoCtrl)).toBe(false);
});

test('a frame nested directly inside a section stays click-through, just like a top-level frame', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-nested-frame-click-through');
  await expect(designPage.canvas).toBeVisible();

  // a frame with its own rectangle, then a section around them — frame drawing must finish before
  // drawSection, since the frame/section/slice toolbar dropdown swaps its visible radio to whatever
  // was last used, which would break a later selectTool('frame')
  await designPage.drawFrame(950, 200, 1250, 550);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawRectangle(1000, 300, 1100, 400);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawSection(600, 100, 1400, 750);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  const rows = rowsOf(page);
  const sectionRow = rows.filter({ hasText: 'Section 1' });
  const frameRow = rows.filter({ hasText: 'Frame 1' });
  const rectRow = rows.filter({ hasText: 'Rectangle' });

  await dragRowOnto(rectRow, frameRow); // rectangle → frame
  await frameRow.locator('[class*="TreeItem__toggleButton"]').click(); // reveal the frame's child again
  await dragRowOnto(frameRow, sectionRow); // frame (now non-empty) → section

  // a plain click on the rectangle inside the frame reaches it directly, no Control needed — the
  // frame's own click-through status is unaffected by having a section (rather than the page root)
  // as its parent. Deleting the selection then proves exactly what got selected, sidestepping the
  // fragility of keeping deep Layers rows expanded and visible.
  await designPage.click(1050, 350);
  await page.keyboard.press('Delete');

  // the section (now expanded) holds only the frame, which is itself now empty (its rectangle is
  // gone) — so the frame row shows no expand toggle
  await sectionRow.locator('[class*="TreeItem__toggleButton"]').click();
  await expect(rows).toHaveCount(2);
  await expect(rows.filter({ hasText: 'Rectangle' })).toHaveCount(0);
  await expect(frameRow.locator('[class*="TreeItem__toggleButton"]')).toHaveCount(0);
});

test('a section can never be dropped into a frame or into another section via the Layers panel', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-nested-drop-rejected');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 100, 900, 400);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawSection(1000, 100, 1300, 400);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawSection(600, 500, 900, 750);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  const rows = rowsOf(page);
  const frameRow = rows.filter({ hasText: 'Frame 1' });
  const firstSectionRow = rows.filter({ hasText: 'Section 1' });
  const secondSectionRow = rows.filter({ hasText: 'Section 2' });

  await expect(rows).toHaveCount(3);

  // attempting to nest a section into a frame changes nothing — no row collapses into the frame
  await dragRowOnto(firstSectionRow, frameRow);
  await expect(rows).toHaveCount(3);
  await expect(frameRow.locator('[class*="TreeItem__toggleButton"]')).toHaveCount(0);

  // attempting to nest a section into another section also changes nothing
  await dragRowOnto(firstSectionRow, secondSectionRow);
  await expect(rows).toHaveCount(3);
  await expect(secondSectionRow.locator('[class*="TreeItem__toggleButton"]')).toHaveCount(0);
});

test('dragging a shape on the canvas onto a section reparents it into the section, exactly like dropping onto a frame', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-nested-canvas-drag-drop');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSection(600, 100, 1400, 750);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawRectangle(1500, 200, 1600, 300); // loose, clear of the section and both panels
  await designPage.click(1550, 250); // select it

  // drag it from its own position onto the section's empty body
  await designPage.pointerDown(1550, 250);
  await page.mouse.move(700, 700, { steps: 12 });
  await page.waitForTimeout(150); // let the drop-target highlight settle before releasing
  await designPage.pointerUp();

  const rows = rowsOf(page);

  // the rectangle left the root — only the section remains there
  await expect(rows).toHaveCount(1);

  // expanding the section reveals the rectangle nested inside it
  await rows.filter({ hasText: 'Section 1' }).locator('[class*="TreeItem__toggleButton"]').click();
  await expect(rows.filter({ hasText: 'Rectangle' })).toHaveCount(1);
});
