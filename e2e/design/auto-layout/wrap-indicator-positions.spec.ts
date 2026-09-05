import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// a 250-wide frame fits exactly two 100-wide children per row (100 + 20 gap + 100 = 220 <= 250), so
// a third wraps onto its own row 2, flush left under the first
const FRAME = { x1: 600, x2: 850, y1: 150, y2: 500 };

const setFlowHorizontal = async (page: Page): Promise<void> => {
  await page.locator('[data-test-toggle-button-group="flow"]').getByLabel('Horizontal', { exact: true }).click();
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

// drags whatever is under (from) to (to), pausing before release so the drop indicator (computed
// live off the mousemove) has settled — mirrors flow.spec.ts/reorder.spec.ts's own dragInto
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

// starts a real drag and pauses before release, WITHOUT releasing — so a test can sample the
// indicator before deciding where to drop it
const startDrag = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
};

// samples a single pixel's RGB out of a tiny clipped screenshot — same PNG-decode technique
// mask.spec.ts uses for pixel-level assertions
const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

// FRAME_DROP_TARGET_STROKE (#337ae1 = rgb 51,122,225), with a small tolerance for renderer rounding
const isDropIndicatorBlue = ([r, g, b]: [number, number, number]): boolean => r > 35 && r < 70 && g > 105 && g < 140 && b > 205 && b < 240;

const rectangleRowNames = (page: Page): Promise<string[]> =>
  page.locator('[class*="Tree__row_"]').filter({ hasText: 'Rectangle' }).allInnerTexts();

test.describe('auto-layout — Horizontal + Wrap drop indicator ignores whether the dragged item actually fits', () => {
  test('shows and commits "between 1 and 2" for an oversized item that could never fit in row 1', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-wrap-indicator-between-siblings');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowHorizontal(page);
    await clickWrapToggle(page);
    await setHorizontalGap(page, 20);

    // three 100x100 children, dropped so 1 and 2 share row 1 and 3 wraps onto row 2 alone
    await designPage.drawRectangle(1400, 160, 1500, 260);
    await dragInto(page, { x: 1450, y: 210 }, { x: 650, y: 200 });

    await designPage.drawRectangle(1400, 300, 1500, 400);
    await dragInto(page, { x: 1450, y: 350 }, { x: 650, y: 200 });

    await designPage.drawRectangle(1400, 440, 1500, 540);
    await dragInto(page, { x: 1450, y: 490 }, { x: 650, y: 200 });

    const before = await rectangleRowNames(page);

    expect(before).toHaveLength(3);

    // a 4th child, 300px wide — far too wide to ever share row 1 with '1' and '2' — dragged to the
    // gap between them (row 1, y≈200)
    await designPage.drawRectangle(1400, 600, 1700, 700);
    await startDrag(page, { x: 1550, y: 650 }, { x: 710, y: 200 });

    // the indicator still shows up mid-gap, exactly as it would for a normally-sized item —
    // whether it fits is irrelevant to where the indicator suggests the item lands in order
    expect(isDropIndicatorBlue(await readPixelColor(page, 710, 200))).toBe(true);

    await page.mouse.up();

    const after = await rectangleRowNames(page);

    // the oversized child lands between '1' and '2' in the Layers order, same as any normal-sized
    // item would — the real wrap engine re-flows the actual geometry once the drop commits
    expect(after).toHaveLength(4);
    expect(after).toEqual([before[0], after[1], before[1], before[2]]);
  });

  test('hugs the left wall of row 2 for an oversized item that could never share a row with anything', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-wrap-indicator-hug-row2-wall');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowHorizontal(page);
    await clickWrapToggle(page);
    await setHorizontalGap(page, 20);

    await designPage.drawRectangle(1400, 160, 1500, 260);
    await dragInto(page, { x: 1450, y: 210 }, { x: 650, y: 200 });

    await designPage.drawRectangle(1400, 300, 1500, 400);
    await dragInto(page, { x: 1450, y: 350 }, { x: 650, y: 200 });

    await designPage.drawRectangle(1400, 440, 1500, 540);
    await dragInto(page, { x: 1450, y: 490 }, { x: 650, y: 200 });

    const before = await rectangleRowNames(page);

    // a 4th, 300px-wide child, dragged to '3'’s own left edge on row 2 (y≈300)
    await designPage.drawRectangle(1400, 600, 1700, 700);
    await startDrag(page, { x: 1550, y: 650 }, { x: 620, y: 300 });

    // the indicator hugs the frame's own left wall, at row 2's own height — not row 1's
    expect(isDropIndicatorBlue(await readPixelColor(page, FRAME.x1 + 3, 275))).toBe(true);
    expect(isDropIndicatorBlue(await readPixelColor(page, FRAME.x1 + 3, 180))).toBe(false);

    await page.mouse.up();

    const after = await rectangleRowNames(page);

    // the oversized child lands right before '3' — pushing it further right/down once the real
    // wrap engine reflows, but still directly ahead of it in order
    expect(after).toHaveLength(4);
    expect(after).toEqual([before[0], before[1], after[2], before[2]]);
  });
});
