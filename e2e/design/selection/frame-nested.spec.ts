import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// each test drives several sequential Layers-panel drags plus real pointer gestures, all timing
// sensitive (see the settle waits below) — running this file's tests alongside three other heavy
// WebGL browser instances under the default parallel workers reliably starves them of CPU and turns
// otherwise-solid waits into flaky timeouts, so this file always runs its own tests one at a time
test.describe.configure({ mode: 'serial' });

// A three-level frame chain: outer (click-through, root) > middle > inner, plus a plain rectangle
// nested inside inner as the actual (non-frame) content. Every frame is drawn at its own final,
// visually-nested position up front — reparenting via the Layers panel never moves a node's x/y, so
// what's drawn "inside" another frame's bounds here stays exactly where it is once nested for real.
const OUTER = { x1: 600, x2: 1400, y1: 100, y2: 750 };
const MIDDLE = { x1: 700, x2: 1200, y1: 200, y2: 650 };
const INNER = { x1: 800, x2: 1000, y1: 300, y2: 550 };
const RECT = { x1: 850, x2: 950, y1: 380, y2: 470 };

// a point inside MIDDLE but outside INNER — hits the middle frame's own body
const MIDDLE_ONLY_POINT = { x: 750, y: 250 };
// a point inside INNER but outside RECT — hits the inner frame's own body
const INNER_ONLY_POINT = { x: 820, y: 320 };
// a point inside RECT — the actual content, reachable only via Ctrl
const RECT_POINT = { x: 900, y: 420 };
// well clear of every frame — deselects
const EMPTY_POINT = { x: 1650, y: 950 };

// drags the vertical centre of one Layers row onto the vertical centre of another (mirrors
// layers-drag-drop.spec.ts's own helper)
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
  // mouseup is processed, or the drop can resolve as a reorder instead of nesting inside the target
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const buildNestedFrames = async (designPage: DesignPage, page: Page): Promise<void> => {
  await designPage.drawFrame(OUTER.x1, OUTER.y1, OUTER.x2, OUTER.y2);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawFrame(MIDDLE.x1, MIDDLE.y1, MIDDLE.x2, MIDDLE.y2);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawFrame(INNER.x1, INNER.y1, INNER.x2, INNER.y2);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawRectangle(RECT.x1, RECT.y1, RECT.x2, RECT.y2);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  const rows = page.locator('[class*="LayersTree"]').first().locator('[class*="Tree__row_"]');
  const outerRow = rows.filter({ hasText: 'Frame 1' });
  const middleRow = rows.filter({ hasText: 'Frame 2' });
  const innerRow = rows.filter({ hasText: 'Frame 3' });
  const rectRow = rows.filter({ hasText: 'Rectangle' });

  await dragRowOnto(middleRow, outerRow);
  await outerRow.locator('[class*="TreeItem__toggleButton"]').click(); // reveal Frame 2's row
  await dragRowOnto(innerRow, middleRow);
  await middleRow.locator('[class*="TreeItem__toggleButton"]').click(); // reveal Frame 3's row
  await dragRowOnto(rectRow, innerRow);
  await innerRow.locator('[class*="TreeItem__toggleButton"]').click(); // reveal Rectangle's row
};

test('a plain click reaches a frame nested any number of levels deep, but never its actual content', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-nested-plain-click');
  await expect(designPage.canvas).toBeVisible();
  await buildNestedFrames(designPage, page);

  const rows = page.locator('[class*="LayersTree"]').first().locator('[class*="Tree__row_"]');
  const outerRow = rows.filter({ hasText: 'Frame 1' });
  const middleRow = rows.filter({ hasText: 'Frame 2' });
  const innerRow = rows.filter({ hasText: 'Frame 3' });
  const rectRow = rows.filter({ hasText: 'Rectangle' });

  // clicking the middle frame's own body selects it directly — one hop from the click-through outer
  await designPage.click(MIDDLE_ONLY_POINT.x, MIDDLE_ONLY_POINT.y);
  await expect(middleRow.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(outerRow.locator('[aria-selected="true"]')).toHaveCount(0);
  await expect(innerRow.locator('[aria-selected="true"]')).toHaveCount(0);

  // clicking the inner frame's own body — two levels deep — also selects it directly, no Control needed
  await designPage.click(INNER_ONLY_POINT.x, INNER_ONLY_POINT.y);
  await expect(innerRow.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(middleRow.locator('[aria-selected="true"]')).toHaveCount(0);

  // a plain click directly on the rectangle (real content sitting inside the inner frame) still
  // resolves to the inner frame, not the rectangle
  await designPage.click(RECT_POINT.x, RECT_POINT.y);
  await expect(innerRow.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(rectRow.locator('[aria-selected="true"]')).toHaveCount(0);

  // Ctrl+click on that same point reaches the rectangle directly
  await designPage.click(RECT_POINT.x, RECT_POINT.y, { ctrl: true });
  await expect(rectRow.locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(innerRow.locator('[aria-selected="true"]')).toHaveCount(0);
});

test('hover matches click at every nesting depth, and Control reaches the same content it would select', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-nested-hover');
  await expect(designPage.canvas).toBeVisible();
  await buildNestedFrames(designPage, page);

  const safeArea = await designPage.canvasSafeArea();

  // hovering the inner frame's own empty body, and hovering the rectangle inside it without Control,
  // both resolve to the same node (the inner frame) — the highlight must look identical either way
  await page.mouse.move(INNER_ONLY_POINT.x, INNER_ONLY_POINT.y);
  const hoverInnerBody = await page.screenshot({ clip: safeArea });

  await page.mouse.move(RECT_POINT.x, RECT_POINT.y);
  const hoverRectNoCtrl = await page.screenshot({ clip: safeArea });

  expect(hoverRectNoCtrl.equals(hoverInnerBody)).toBe(true);

  // holding Control over the rectangle instead highlights the rectangle itself — a different result
  await page.keyboard.down('Control');
  await page.mouse.move(RECT_POINT.x + 1, RECT_POINT.y + 1); // force a fresh move event
  await page.mouse.move(RECT_POINT.x, RECT_POINT.y);
  const hoverRectCtrl = await page.screenshot({ clip: safeArea });
  await page.keyboard.up('Control');

  expect(hoverRectCtrl.equals(hoverRectNoCtrl)).toBe(false);
});

test('a frame nested inside another frame never shows its name label, unlike a top-level frame or one nested in a section', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-nested-label');
  await expect(designPage.canvas).toBeVisible();

  // frame A — will end up nested inside a frame
  await designPage.drawFrame(MIDDLE.x1, MIDDLE.y1, MIDDLE.x2, MIDDLE.y2);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  // frame B — will end up nested inside a section instead
  const sectionChildArea = { x1: 1250, x2: 1350, y1: 200, y2: 300 };

  await designPage.drawFrame(sectionChildArea.x1, sectionChildArea.y1, sectionChildArea.x2, sectionChildArea.y2);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  // the label sits just above each frame's own top-left corner
  const labelAreaA = { height: 20, width: 160, x: MIDDLE.x1 - 5, y: MIDDLE.y1 - 24 };

  await page.mouse.move(EMPTY_POINT.x, EMPTY_POINT.y);
  const labelAWhileTopLevel = await page.screenshot({ clip: labelAreaA });

  // frame drawing is done — safe to switch the frame/section/slice dropdown to Section now
  await designPage.drawFrame(OUTER.x1, OUTER.y1, OUTER.x2, OUTER.y2);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawSection(1200, 100, 1400, 400);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  const rows = page.locator('[class*="LayersTree"]').first().locator('[class*="Tree__row_"]');

  // creation order: Frame 1 = A (MIDDLE), Frame 2 = B (section child), Frame 3 = OUTER, Section 1
  await dragRowOnto(rows.filter({ hasText: 'Frame 1' }), rows.filter({ hasText: 'Frame 3' })); // A into the outer frame
  await dragRowOnto(rows.filter({ hasText: 'Frame 2' }), rows.filter({ hasText: 'Section 1' })); // B into the section

  await page.mouse.move(EMPTY_POINT.x, EMPTY_POINT.y);
  const labelAWhileNested = await page.screenshot({ clip: labelAreaA });

  // nested directly inside a frame — the exact same screen area no longer shows the label
  expect(labelAWhileNested.equals(labelAWhileTopLevel)).toBe(false);

  // nested inside a section instead — the label is still there and interactive: double-clicking it at
  // its own (unmoved) canvas position opens the rename overlay, proven by the Layers panel updating —
  // a DOM-level check instead of a pixel comparison, since a section's own nearby chrome makes a
  // pixel-perfect "unchanged" comparison too fragile to rely on
  await designPage.doubleClick(sectionChildArea.x1 + 15, sectionChildArea.y1 - 12);
  await page.keyboard.type('Renamed');
  await page.keyboard.press('Enter');

  await expect(rows.filter({ hasText: 'Renamed' })).toHaveCount(1);
});

test('marquee reaches a frame nested two levels deep without needing to fully enclose either ancestor', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-nested-marquee');
  await expect(designPage.canvas).toBeVisible();
  await buildNestedFrames(designPage, page);

  const rows = page.locator('[class*="LayersTree"]').first().locator('[class*="Tree__row_"]');

  // starts in the outer frame's own margin (outside the middle frame entirely, so nothing is hit and
  // a marquee arms), then fully encloses the inner frame while only partially touching the middle one
  // and coming nowhere near fully enclosing the outer frame
  await designPage.selectTool('default');
  await designPage.pointerDown(650, 150);
  await page.mouse.move(1050, 560, { steps: 10 });
  await page.waitForTimeout(150); // let the marquee's collision pass settle before releasing
  await designPage.pointerUp();

  // deleting the marquee's selection is a real, user-visible consequence that proves exactly what got
  // selected, sidestepping any question about how the Layers panel highlights a multi-selection
  await page.keyboard.press('Delete');

  // the middle and inner frames (and the rectangle nested inside the inner one) are gone; the outer
  // frame — never fully enclosed — survives untouched
  await expect(rows).toHaveCount(1);
  await expect(rows.filter({ hasText: 'Frame 1' })).toHaveCount(1);
});

test('a Ctrl-held drag starting on a nested frame draws a marquee instead of moving that frame', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-nested-ctrl-drag-marquee');
  await expect(designPage.canvas).toBeVisible();
  await buildNestedFrames(designPage, page);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.selectTool('default');

  // the middle frame's own footprint, captured with nothing selected or hovering over it
  const middleFootprintArea = { height: MIDDLE.y2 - MIDDLE.y1, width: MIDDLE.x2 - MIDDLE.x1, x: MIDDLE.x1, y: MIDDLE.y1 };
  const footprintBefore = await page.screenshot({ clip: middleFootprintArea });

  // Ctrl+drag starting on the middle frame's own body — a plain drag here would grab and move it
  await page.keyboard.down('Control');
  await designPage.pointerDown(MIDDLE_ONLY_POINT.x, MIDDLE_ONLY_POINT.y);
  await page.mouse.move(900, 400, { steps: 10 });
  await page.waitForTimeout(150); // let the marquee's collision pass settle before releasing
  await designPage.pointerUp();
  await page.keyboard.up('Control');

  // deselect (clearing any selection outline that would otherwise sit right at this same clip's edges),
  // then confirm the middle frame's own body never actually moved from its footprint — a real drag
  // would have repainted it 150px/150px away from where it started. Whether the resulting marquee
  // correctly reaches nested content is already covered by the previous test; this one only needs to
  // prove the frame itself was never dragged.
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  const footprintAfter = await page.screenshot({ clip: middleFootprintArea });

  expect(footprintAfter.equals(footprintBefore)).toBe(true);
});
