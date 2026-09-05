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

const setFlowHorizontal = async (page: Page): Promise<void> => {
  await flowGroup(page).getByLabel('Horizontal', { exact: true }).click();
};

const clickWrapToggle = async (page: Page): Promise<void> => {
  await page.getByLabel('Wrap', { exact: true }).click();
};

const setHorizontalGap = async (page: Page, gap: number): Promise<void> => {
  const gapInput = page.locator('[data-test-text-field-input="gap"]').first();

  await gapInput.click();
  await gapInput.fill(String(gap));
  await gapInput.press('Enter');
};

// samples a single pixel's RGB out of a tiny clipped screenshot — same PNG-decode technique the
// indicator-position specs use
const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

// RECTANGLE_FILL is #D9D9D9 (neutral gray 217) — distinct from the frame's own white body and from
// the blue drop indicator
const isRectangleGray = ([r, g, b]: [number, number, number]): boolean =>
  r > 195 && r < 235 && g > 195 && g < 235 && b > 195 && b < 235 && Math.max(r, g, b) - Math.min(r, g, b) < 15;

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
    // for an auto-layout frame, the Layers panel lists children in the same (forward) order as the
    // frame's own childIds — matching the visual layout flow, unlike a plain frame/group which lists
    // front-most (last in childIds) first. The dragged child (before[2], spatially at the bottom =
    // last in childIds) moves to the very front of childIds — so the new panel order is exactly
    // [before[2], before[0], before[1]]
    expect(after).toHaveLength(3);
    expect([...after].sort()).toEqual([...before].sort());
    expect(after).not.toEqual(before);
    expect(after).toEqual([before[2], before[0], before[1]]);
  });

  test('dragging a multi-node selection reorders it together within the frame, preserving the block’s own relative order', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-reorder-multi-select');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Vertical');

    // same three-child stack as above: Rectangle 1 at y150-210, Rectangle 2 at y210-270,
    // Rectangle 3 at y270-330
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 630, y: 300 });

    const before = await rectangleRowNames(page);

    // select the bottom two children together (Rectangle 2 and Rectangle 3)
    await designPage.click(630, 240);
    await designPage.click(630, 300, { shift: true });

    // drag the pair, grabbed from within Rectangle 2, up past Rectangle 1 to the very top — before
    // the fix, a multi-node drag inside an auto-layout frame fell back to a plain positional
    // dispatch instead of tracking the reorder-preview ghost, so the drag visually fought the
    // layout engine's own resync and never actually reordered
    await dragInto(page, { x: 630, y: 240 }, { x: 630, y: 160 });

    const after = await rectangleRowNames(page);

    // the dragged pair moves to the front as one block, keeping their own relative order —
    // Rectangle 2 above Rectangle 3, both now above Rectangle 1
    expect(after).toEqual([before[1], before[2], before[0]]);
  });

  test('dragging a multi-node selection preserves the pair’s own current order even when they were clicked in the opposite (bottom-first) order', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-reorder-multi-select-click-order');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Vertical');

    // same three-child stack as above: Rectangle 1 at y150-210, Rectangle 2 at y210-270,
    // Rectangle 3 at y270-330
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 630, y: 300 });

    const before = await rectangleRowNames(page);

    // select the bottom two children in bottom-first click order (Rectangle 3, then Rectangle 2)
    // — the opposite of their visual/childIds order. Before the fix, the drag committed the
    // dragged block using raw click/selection order, silently swapping Rectangle 2 and Rectangle 3
    // relative to each other
    await designPage.click(630, 300);
    await designPage.click(630, 240, { shift: true });

    await dragInto(page, { x: 630, y: 240 }, { x: 630, y: 160 });

    const after = await rectangleRowNames(page);

    // still Rectangle 2 above Rectangle 3, matching their pre-drag order, not click order
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

test.describe('auto-layout — reordering a child within its own frame, wrap enabled', () => {
  test('leaves 1 and 2 untouched when reordering 3 slightly within its own row, which nothing else shares', async ({ page }) => {
    const designPage = new DesignPage(page);

    // a 250-wide frame fits exactly two 100-wide children per row (100 + 20 gap + 100 = 220 <= 250),
    // so a third wraps onto its own row 2, flush left under the first
    const wrapFrame = { x1: 600, x2: 850, y1: 150, y2: 500 };

    await designPage.goto('e2e-test-auto-layout-reorder-within-wrapped-row');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(wrapFrame.x1, wrapFrame.y1, wrapFrame.x2, wrapFrame.y2);
    await setFlowHorizontal(page);
    await clickWrapToggle(page);
    await setHorizontalGap(page, 20);

    // three 100x100 children: 1 and 2 share row 1, 3 wraps alone onto row 2 flush left
    await designPage.drawRectangle(1400, 160, 1500, 260);
    await dragInto(page, { x: 1450, y: 210 }, { x: 650, y: 200 });

    await designPage.drawRectangle(1400, 300, 1500, 400);
    await dragInto(page, { x: 1450, y: 350 }, { x: 650, y: 200 });

    await designPage.drawRectangle(1400, 440, 1500, 540);
    await dragInto(page, { x: 1450, y: 490 }, { x: 650, y: 200 });

    const before = await rectangleRowNames(page);

    expect(before).toHaveLength(3);

    // regression: '3' is excluded from the sibling list while it's being dragged (it's the moved
    // node), so its own row-2 band used to collapse once removed, and the cursor (still squarely
    // inside row 2) misresolved into row 1 — dragging 1 and 2 along with it to the very front even
    // though they no longer fit alongside 3. Nudging 3 slightly left, still well inside its own row,
    // must not perturb 1 or 2 at all
    await dragInto(page, { x: 650, y: 320 }, { x: 620, y: 320 });

    const after = await rectangleRowNames(page);

    expect(after).toEqual(before);
  });

  test('lets a child be dragged toward another row and then dropped straight back onto its own slot', async ({ page }) => {
    const designPage = new DesignPage(page);

    // a 200-wide frame, no gaps, six 100x100 children: rows [1,2] / [3,4] / [5,6]
    const wrapFrame = { x1: 600, x2: 800, y1: 150, y2: 520 };

    await designPage.goto('e2e-test-auto-layout-reorder-wrapped-drop-back');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(wrapFrame.x1, wrapFrame.y1, wrapFrame.x2, wrapFrame.y2);
    await setFlowHorizontal(page);
    await clickWrapToggle(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 6; index += 1) {
      await designPage.drawRectangle(1400, 160, 1500, 260);
      await dragInto(page, { x: 1450, y: 210 }, { x: 790, y: 500 });
    }

    const before = await rectangleRowNames(page);

    expect(before).toHaveLength(6);

    // grab '3' (row 2, first cell — screen centre ~(650, 300)), drag it up toward '1', then bring
    // it back over the left half of its own row 2 and release. Regression: '4' slid left to fill
    // the gap the instant the drag started, so its near edge sat at the row's left wall and the
    // "before 4" slot ('3'’s own base) was unreachable — releasing here committed [1,2,4,3,5,6].
    await page.mouse.move(650, 300);
    await page.mouse.down();
    await page.mouse.move(630, 190, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.move(640, 300, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();

    const after = await rectangleRowNames(page);

    expect(after).toEqual(before);
  });

  test('keeps "insert before" while the cursor is anywhere over the target cell when moving a child up from a later row', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    const wrapFrame = { x1: 600, x2: 850, y1: 150, y2: 500 };

    await designPage.goto('e2e-test-auto-layout-reorder-wrapped-cell-zone');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(wrapFrame.x1, wrapFrame.y1, wrapFrame.x2, wrapFrame.y2);
    await setFlowHorizontal(page);
    await clickWrapToggle(page);
    await setHorizontalGap(page, 20);

    // three 100x100 children: 1 and 2 share row 1, 3 wraps alone onto row 2
    await designPage.drawRectangle(1400, 160, 1500, 260);
    await dragInto(page, { x: 1450, y: 210 }, { x: 650, y: 200 });

    await designPage.drawRectangle(1400, 300, 1500, 400);
    await dragInto(page, { x: 1450, y: 350 }, { x: 650, y: 200 });

    await designPage.drawRectangle(1400, 440, 1500, 540);
    await dragInto(page, { x: 1450, y: 490 }, { x: 650, y: 200 });

    const before = await rectangleRowNames(page);

    expect(before).toHaveLength(3);

    // drag '3' up from its own row 2 and drop it with the cursor over the RIGHT half of item 1's
    // own cell (x1+80: past item 1's midpoint at x1+50, but still inside its 0-100 cell). Regression:
    // a plain midpoint threshold read this as "between 1 and 2" and committed [1,3,2]; the reorder's
    // far-edge threshold treats the whole of item 1's cell as "insert before 1".
    await dragInto(page, { x: wrapFrame.x1 + 50, y: wrapFrame.y1 + 170 }, { x: wrapFrame.x1 + 80, y: wrapFrame.y1 + 50 });

    const after = await rectangleRowNames(page);

    // '3' landed at the very front, not wedged between 1 and 2
    expect(after).toEqual([before[2], before[0], before[1]]);
  });

  test('previews a multi-row block as its own members — 1 slides up a row, not 1 and 2 dumped a row too far down', async ({ page }) => {
    const designPage = new DesignPage(page);

    // a 100-wide frame, no gaps, six 50x50 children: rows [1,2] / [3,4] / [5,6]
    const wrapFrame = { x1: 600, x2: 700, y1: 150, y2: 450 };

    await designPage.goto('e2e-test-auto-layout-reorder-wrapped-block');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(wrapFrame.x1, wrapFrame.y1, wrapFrame.x2, wrapFrame.y2);
    await setFlowHorizontal(page);
    await clickWrapToggle(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 6; index += 1) {
      await designPage.drawRectangle(1400, 160, 1450, 210);
      // dropped past the growing stack's midpoint every time, so they settle in drop order 1..6
      await dragInto(page, { x: 1425, y: 185 }, { x: 690, y: 290 });
    }

    const before = await rectangleRowNames(page);

    expect(before).toHaveLength(6);

    // select the block {3,4,5} — it spans two rows in the current layout (3,4 on row 2; 5 on row 3)
    await designPage.click(625, 225);
    await designPage.click(675, 225, { shift: true });
    await designPage.click(625, 275, { shift: true });

    // start dragging the block toward the very front (slot 1), and hold — sampling the live
    // reorder preview before releasing
    await page.mouse.move(675, 225);
    await page.mouse.down();
    await page.mouse.move(610, 160, { steps: 10 });
    await page.waitForTimeout(300);

    // regression: the block used to be modelled as ONE merged 100x100 placeholder, which took a
    // whole double-height row of its own and shoved BOTH 1 and 2 down together onto what reads as
    // row 3 — leaving a gray sibling sitting in the row-3 band (frame-local y150-200). With the
    // block modelled as its three real 50px members, nothing reaches that band: 1 only slides up
    // into row 2, 2 into row 3's first slot, 6 holds.
    expect(isRectangleGray(await readPixelColor(page, wrapFrame.x1 + 25, wrapFrame.y1 + 185))).toBe(false);

    await page.mouse.up();

    const after = await rectangleRowNames(page);

    // committed order (the real wrap engine, unchanged): block {3,4,5} moves to the front
    expect(after).toEqual([before[2], before[3], before[4], before[0], before[1], before[5]]);
  });

  const buildSixChildGrid = async (designPage: DesignPage, page: Page): Promise<string[]> => {
    // a 100-wide frame, no gaps, six 50x50 children: rows [1,2] / [3,4] / [5,6]
    await designPage.drawFrame(600, 150, 700, 450);
    await setFlowHorizontal(page);
    await clickWrapToggle(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 6; index += 1) {
      await designPage.drawRectangle(1400, 160, 1450, 210);
      await dragInto(page, { x: 1425, y: 185 }, { x: 690, y: 290 });
    }

    return rectangleRowNames(page);
  };

  test('anchors a dragged multi-node block by its FIRST member when that member is the one grabbed', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-reorder-block-grab-first');
    await expect(designPage.canvas).toBeVisible();

    const before = await buildSixChildGrid(designPage, page);

    expect(before).toHaveLength(6);

    // select {3,4} (row 2), grab element 3 (its own centre), drag onto element 5's cell (row 3)
    await designPage.click(625, 225);
    await designPage.click(675, 225, { shift: true });
    await dragInto(page, { x: 625, y: 225 }, { x: 625, y: 275 });

    // grabbed the first block member → the whole block lands after 5 and 6: [1,2,5,6,3,4]
    expect(await rectangleRowNames(page)).toEqual([before[0], before[1], before[4], before[5], before[2], before[3]]);
  });

  test('offsets a dragged multi-node block by which member was grabbed — grabbing the last member lands it a slot earlier', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-reorder-block-grab-last');
    await expect(designPage.canvas).toBeVisible();

    const before = await buildSixChildGrid(designPage, page);

    expect(before).toHaveLength(6);

    // same selection {3,4} and same drop point, but grab element 4 (the second block member)
    await designPage.click(625, 225);
    await designPage.click(675, 225, { shift: true });
    await dragInto(page, { x: 675, y: 225 }, { x: 625, y: 275 });

    // grabbed the second member → block lands one slot earlier: [1,2,5,3,4,6]
    expect(await rectangleRowNames(page)).toEqual([before[0], before[1], before[4], before[2], before[3], before[5]]);
  });
});
