import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// a frame drawn well clear of the LeftPanel/RightPanel overlays, with room to its right to draw and
// drag in children from outside its own bounds (drawing a shape never auto-parents it into a frame
// under it — only a real drag, which is what the auto-layout drop-target/indicator plumbing needs)
const FRAME = { x1: 600, x2: 1100, y1: 150, y2: 700 };
const FRAME_AREA = { height: FRAME.y2 - FRAME.y1, width: FRAME.x2 - FRAME.x1, x: FRAME.x1, y: FRAME.y1 };

const flowGroup = (page: Page): Locator => page.locator('[data-test-toggle-button-group="flow"]');

const setFlow = async (page: Page, direction: 'Horizontal' | 'Vertical'): Promise<void> => {
  await flowGroup(page).getByLabel(direction, { exact: true }).click();
};

// drags whatever is under (from) to (to), pausing before release so the auto-layout drop
// indicator (computed live off the mousemove) has settled on its final insertion index — mirrors
// frame-nested.spec.ts's own drop-settle wait for the same reason
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

// selects the frame back via its own Layers-panel row instead of a canvas click — a plain canvas
// click on a frame's own empty body no longer resolves to the frame once it has any child (a real,
// pre-existing bug reproduced separately, unrelated to Flow itself: see the note left in
// docs/test-cases-auto-layout.md). The Layers row is an independent, working selection path
// (`useSelectTreeItem`, no canvas hit-testing involved), so it sidesteps that bug entirely.
const selectFrameRow = async (page: Page): Promise<void> => {
  await page.locator('[class*="Tree__row_"]').filter({ hasText: 'Frame' }).first().click();
};

test.describe('auto-layout — Flow (Horizontal / Vertical)', () => {
  test('switching Flow reflows the frame’s children, and switching back restores the same layout', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-round-trip');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2); // auto-selects the frame
    await expect(flowGroup(page)).toBeVisible();
    await setFlow(page, 'Horizontal');

    // three children, drawn off to the side and dragged in one at a time, so each goes through the
    // real drop-into-auto-layout-frame path instead of starting out already parented
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 700, y: 300 });

    await selectFrameRow(page);

    const horizontal = await page.screenshot({ clip: FRAME_AREA });

    await setFlow(page, 'Vertical');
    const vertical = await page.screenshot({ clip: FRAME_AREA });

    expect(vertical.equals(horizontal)).toBe(false);

    await setFlow(page, 'Horizontal');
    const horizontalAgain = await page.screenshot({ clip: FRAME_AREA });

    expect(horizontalAgain.equals(horizontal)).toBe(true);
  });

  test('Horizontal flow repacks the row live as a new child is dragged into the frame', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-horizontal-grows');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Horizontal');

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 700, y: 300 });

    await selectFrameRow(page);
    const withTwoChildren = await page.screenshot({ clip: FRAME_AREA });

    // a third child, dragged in while the frame is already in Horizontal flow, joins the same row
    // live — no need to re-toggle Flow for it to take its place
    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 700, y: 300 });
    await selectFrameRow(page);

    const withThreeChildren = await page.screenshot({ clip: FRAME_AREA });

    expect(withThreeChildren.equals(withTwoChildren)).toBe(false);
  });

  test('Vertical flow arranges mixed node types (rectangle, ellipse, line) as boxes, distinctly from Horizontal', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-mixed-node-types');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Horizontal');

    await designPage.drawRectangle(1400, 160, 1470, 220);
    await dragInto(page, { x: 1435, y: 190 }, { x: 700, y: 300 });

    await designPage.drawEllipse(1400, 300, 1470, 360);
    await dragInto(page, { x: 1435, y: 330 }, { x: 700, y: 300 });

    await designPage.drawLine(1400, 460, 1470, 460);
    await dragInto(page, { x: 1435, y: 460 }, { x: 700, y: 300 });

    await selectFrameRow(page);

    const horizontal = await page.screenshot({ clip: FRAME_AREA });

    await setFlow(page, 'Vertical');
    const vertical = await page.screenshot({ clip: FRAME_AREA });

    expect(vertical.equals(horizontal)).toBe(false);
  });

  test('setting Flow to Vertical for the first time spreads out children that were freely overlapping', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-vertical-cold-start');
    await expect(designPage.canvas).toBeVisible();

    // no Flow set yet — the frame is still freeform, so every child dropped at the same point just
    // stacks exactly on top of the last one instead of being auto-packed
    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 700, y: 300 });

    await selectFrameRow(page);
    const stacked = await page.screenshot({ clip: FRAME_AREA });

    await setFlow(page, 'Vertical');
    const vertical = await page.screenshot({ clip: FRAME_AREA });

    expect(vertical.equals(stacked)).toBe(false);
  });

  test('deleting a child from a Horizontal-flow frame closes the gap live for the remaining children', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-delete-closes-gap');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Horizontal');

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 700, y: 300 });

    await selectFrameRow(page);
    const withThreeChildren = await page.screenshot({ clip: FRAME_AREA });

    // the most recently dragged-in child sits at the top of its own Layers row group — deleting it
    // should pull the remaining two children together instead of leaving a hole where it was
    await page.locator('[class*="Tree__row_"]').filter({ hasText: 'Rectangle' }).first().click();
    await page.keyboard.press('Delete');

    const afterDelete = await page.screenshot({ clip: FRAME_AREA });

    expect(afterDelete.equals(withThreeChildren)).toBe(false);
  });

  test('Horizontal flow packs five children into a single row, not just two or three', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-horizontal-five-children');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Horizontal');

    for (let index = 0; index < 5; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1440, y + 40);
      await dragInto(page, { x: 1420, y: y + 20 }, { x: 700, y: 300 });
    }

    await selectFrameRow(page);

    const rows = page.locator('[class*="Tree__row_"]');

    await expect(rows.filter({ hasText: 'Rectangle' })).toHaveCount(5);

    const horizontal = await page.screenshot({ clip: FRAME_AREA });

    await setFlow(page, 'Vertical');
    const vertical = await page.screenshot({ clip: FRAME_AREA });

    expect(vertical.equals(horizontal)).toBe(false);
  });
});
