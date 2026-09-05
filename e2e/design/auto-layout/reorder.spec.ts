import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const FRAME = { x1: 600, x2: 1100, y1: 150, y2: 700 };

const flowGroup = (page: Page): Locator => page.locator('[data-test-toggle-button-group="flow"]');

const setFlow = async (page: Page, direction: 'Horizontal' | 'Vertical'): Promise<void> => {
  await flowGroup(page).getByLabel(direction, { exact: true }).click();
};

// drags whatever is under (from) to (to), pausing before release so the auto-layout drop/reorder
// indicator (computed live off the mousemove) has settled before the pointer is released
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const rectangleRowNames = (page: Page): Promise<string[]> =>
  page.locator('[class*="Tree__row_"]').filter({ hasText: 'Rectangle' }).allInnerTexts();

test.describe('auto-layout — reordering a child within its own frame', () => {
  test('dragging a child to a new position among its own siblings reorders it, without ejecting it from the frame', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-reorder-within-frame');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Vertical');

    // three children, dragged in from outside one at a time — same fixture pattern as flow.spec.ts.
    // each is dropped at the same point (630, 300), well past the growing stack's current midpoint,
    // so they settle top-to-bottom in the order they were dropped: Rectangle 1, then 2, then 3
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 630, y: 300 });

    const before = await rectangleRowNames(page);

    expect(before).toHaveLength(3);

    // the bottom-most child in the stack (three 60px-tall, 60px-wide boxes, no gap, packed from the
    // frame's own top-left content-box origin) sits roughly 120-180px down from the frame's top edge,
    // 0-60px in from its left edge — drag it up to the very top of the stack, well inside the frame
    // the whole time, so this is a reorder, not a reparent
    await dragInto(page, { x: 630, y: 295 }, { x: 630, y: 160 });

    const after = await rectangleRowNames(page);

    // still exactly the same three children, nested the whole time — just reshuffled. The Layers
    // panel row order is asserted directly rather than via a canvas screenshot diff: the three
    // children are identical green squares, so a pixel diff would be a coin flip depending on which
    // slots happen to look different, where the exact row order is a precise, unambiguous check.
    //
    // the Layers panel lists children in the reverse of the frame's own childIds order, and the
    // dragged child (before[0], spatially at the bottom = last in childIds) moves to the very front
    // of childIds — so the new panel order is exactly [before[1], before[2], before[0]]
    expect(after).toHaveLength(3);
    expect([...after].sort()).toEqual([...before].sort());
    expect(after).not.toEqual(before);
    expect(after).toEqual([before[1], before[2], before[0]]);
  });

  test('dragging the top child down swaps the instant it touches the next sibling’s own near edge, not its midpoint, and reverts at that same edge', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-reorder-down-threshold');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Vertical');

    // same three-child stack as above: 60px-tall boxes packed from the frame's top-left content-box
    // origin (y=150), no gap — Rectangle 1 at y150-210, Rectangle 2 at y210-270, Rectangle 3 at
    // y270-330. Rectangle 2's own near edge sits at y=210; its midpoint (y=240) is a stale threshold
    // this test rules out directly
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 630, y: 300 });

    const before = await rectangleRowNames(page);

    // dragging the top child to y=202 hasn't yet touched Rectangle 2's near edge (y=210) — no swap
    await dragInto(page, { x: 630, y: 180 }, { x: 630, y: 202 });

    const stillUnswapped = await rectangleRowNames(page);

    expect(stillUnswapped).toEqual(before);

    // now touch y=220 — well past the near edge (210) but well short of the old midpoint (240) — the
    // swap should already have fired
    await dragInto(page, { x: 630, y: 180 }, { x: 630, y: 220 });

    const afterSwap = await rectangleRowNames(page);

    expect(afterSwap).not.toEqual(before);

    // dragging back up past that same y=210 edge (the dragged child now sits at y210-270, grabbed
    // from its own center) reverts to the original order — no extra dead zone beyond the one edge
    await dragInto(page, { x: 630, y: 240 }, { x: 630, y: 202 });

    const afterRevert = await rectangleRowNames(page);

    expect(afterRevert).toEqual(before);
  });
});
