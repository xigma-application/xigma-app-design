import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// a frame drawn well clear of the LeftPanel/RightPanel overlays, with room to its right to draw and
// drag in children from outside its own bounds — same fixture pattern as flow.spec.ts/reorder.spec.ts
const FRAME = { x1: 600, x2: 1100, y1: 150, y2: 400 };

const setFlowHorizontal = async (page: Page): Promise<void> => {
  await page.locator('[data-test-toggle-button-group="flow"]').getByLabel('Horizontal', { exact: true }).click();
};

const setHorizontalGap = async (page: Page, gap: number): Promise<void> => {
  const gapInput = page.locator('[data-test-text-field-input="gap"]');

  await gapInput.click();
  await gapInput.fill(String(gap));
  await gapInput.press('Enter');
};

// starts a real drag and pauses before release so the auto-layout drop indicator (computed live
// off the mousemove) has settled — mirrors flow.spec.ts/reorder.spec.ts's own dragInto, but leaves
// the pointer held down so a test can sample the indicator before deciding where to drop it
const startDrag = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
};

const readChildren = (page: Page): Promise<Record<string, { width: number; x: number }>> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as { childIds: string[] };

    return Object.fromEntries(
      frame.childIds.map((id) => {
        const node = activePage.nodes[id] as { width: number; x: number };

        return [id, { width: node.width, x: node.x }];
      }),
    );
  });

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

test.describe('auto-layout — Horizontal drop indicator positions (Top-left alignment)', () => {
  test('lands the first child’s indicator just off the frame’s own near edge, not flush against it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-indicator-first-position');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowHorizontal(page);

    // an empty frame always resolves to insertion index 0, regardless of where inside it the
    // cursor sits
    await designPage.drawRectangle(1400, 160, 1460, 220); // 60x60
    await startDrag(page, { x: 1430, y: 190 }, { x: 800, y: 300 });

    // the indicator is a thin vertical bar held off the frame's near (left) edge by the minimum
    // 2px gap, spanning the dragged item's own 60px height from the frame's top
    expect(isDropIndicatorBlue(await readPixelColor(page, FRAME.x1 + 3, FRAME.y1 + 30))).toBe(true);

    await page.mouse.up();
  });

  test('centres a mid-drag indicator in the real gap between two siblings, not flush against the next one', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-indicator-between-siblings');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowHorizontal(page);
    await setHorizontalGap(page, 20);

    // two 60x60 children, dropped left-to-right so they land as siblings 20px apart
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await startDrag(page, { x: 1430, y: 190 }, { x: 700, y: 250 });
    await page.mouse.up();

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await startDrag(page, { x: 1430, y: 330 }, { x: 900, y: 250 });
    await page.mouse.up();

    const children = await readChildren(page);
    const [first, second] = Object.values(children).sort((a, b) => a.x - b.x);
    const firstEnd = first.x + first.width;
    const gapMidpoint = Math.round(firstEnd + (second.x - firstEnd) / 2);
    const oldFlushLocation = Math.round(second.x - 1); // the pre-fix location: flush against the next sibling's own edge

    // a third child, dragged to a point between the two existing siblings
    await designPage.drawRectangle(1400, 440, 1460, 500);
    await startDrag(page, { x: 1430, y: 470 }, { x: firstEnd + (second.x - firstEnd) / 2, y: 250 });

    expect(isDropIndicatorBlue(await readPixelColor(page, gapMidpoint, FRAME.y1 + 30))).toBe(true);
    expect(isDropIndicatorBlue(await readPixelColor(page, oldFlushLocation, FRAME.y1 + 30))).toBe(false);

    await page.mouse.up();
  });
});
