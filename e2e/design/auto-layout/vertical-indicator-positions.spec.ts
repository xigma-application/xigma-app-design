import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// a frame drawn well clear of the LeftPanel/RightPanel overlays, with room to its right to draw and
// drag in children from outside its own bounds — same fixture pattern as flow.spec.ts/reorder.spec.ts
const FRAME = { x1: 600, x2: 850, y1: 150, y2: 650 };

const setFlowVertical = async (page: Page): Promise<void> => {
  await page.locator('[data-test-toggle-button-group="flow"]').getByLabel('Vertical', { exact: true }).click();
};

const setAlignment = async (page: Page, label: string): Promise<void> => {
  await page.getByLabel(label, { exact: true }).click();
};

const setVerticalGap = async (page: Page, gap: number): Promise<void> => {
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

const readOnlyChild = (page: Page): Promise<{ height: number; width: number; x: number; y: number }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as { childIds: string[] };
    const child = activePage.nodes[frame.childIds[0]] as { height: number; width: number; x: number; y: number };

    return { height: child.height, width: child.width, x: child.x, y: child.y };
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

test.describe('auto-layout — Vertical drop indicator positions (Center / Bottom-left alignment)', () => {
  test('Center alignment: centres the indicator in the gap before the only child, not flush against the frame’s top edge', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-indicator-vertical-center-first');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowVertical(page);
    await setAlignment(page, 'Center');
    await setVerticalGap(page, 20);

    await designPage.drawRectangle(1400, 160, 1460, 220); // 60x60
    await startDrag(page, { x: 1430, y: 190 }, { x: 725, y: 400 });
    await page.mouse.up();

    const child = await readOnlyChild(page);

    // insert before the only child — its own near (top) edge sits well clear of the frame's own
    // top edge, since the block floats centred; cursor above the child's own midpoint
    await designPage.drawRectangle(1400, 300, 1460, 360);
    await startDrag(page, { x: 1430, y: 330 }, { x: child.x + 30, y: 250 });

    const gapMidpoint = Math.round(child.y - 10); // half of the 20px gap
    const oldFrameEdgeLocation = FRAME.y1 + 3;

    expect(isDropIndicatorBlue(await readPixelColor(page, child.x + 30, gapMidpoint))).toBe(true);
    expect(isDropIndicatorBlue(await readPixelColor(page, child.x + 30, oldFrameEdgeLocation))).toBe(false);

    await page.mouse.up();
  });

  test('Center alignment: centres the indicator in the gap after the only child, not flush against the frame’s bottom edge', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-indicator-vertical-center-last');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowVertical(page);
    await setAlignment(page, 'Center');
    await setVerticalGap(page, 20);

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await startDrag(page, { x: 1430, y: 190 }, { x: 725, y: 400 });
    await page.mouse.up();

    const child = await readOnlyChild(page);

    // append after the only child — cursor below its own midpoint
    await designPage.drawRectangle(1400, 300, 1460, 360);
    await startDrag(page, { x: 1430, y: 330 }, { x: child.x + 30, y: 550 });

    const gapMidpoint = Math.round(child.y + child.height + 10);
    const oldFrameEdgeLocation = FRAME.y2 - 3;

    expect(isDropIndicatorBlue(await readPixelColor(page, child.x + 30, gapMidpoint))).toBe(true);
    expect(isDropIndicatorBlue(await readPixelColor(page, child.x + 30, oldFrameEdgeLocation))).toBe(false);

    await page.mouse.up();
  });

  test('Bottom-left alignment: centres the indicator in the gap before the only child, not flush against the frame’s top edge', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-indicator-vertical-bottom-first');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowVertical(page);
    await setAlignment(page, 'Bottom left');
    await setVerticalGap(page, 20);

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await startDrag(page, { x: 1430, y: 190 }, { x: 650, y: 400 });
    await page.mouse.up();

    const child = await readOnlyChild(page);

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await startDrag(page, { x: 1430, y: 330 }, { x: child.x + 30, y: 250 });

    const gapMidpoint = Math.round(child.y - 10);
    const oldFrameEdgeLocation = FRAME.y1 + 3;

    expect(isDropIndicatorBlue(await readPixelColor(page, child.x + 30, gapMidpoint))).toBe(true);
    expect(isDropIndicatorBlue(await readPixelColor(page, child.x + 30, oldFrameEdgeLocation))).toBe(false);

    await page.mouse.up();
  });

  test('Bottom-left alignment: hugs the frame’s own bottom edge when appending after the only child, not the item’s own top edge', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-indicator-vertical-bottom-last');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowVertical(page);
    await setAlignment(page, 'Bottom left');
    await setVerticalGap(page, 20);

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await startDrag(page, { x: 1430, y: 190 }, { x: 650, y: 400 });
    await page.mouse.up();

    const child = await readOnlyChild(page);

    // append after the only child — regression for the bug where the indicator sat at the item's
    // own top edge (draggedHeight away from the frame's own bottom edge) instead of hugging it
    await designPage.drawRectangle(1400, 300, 1460, 360);
    await startDrag(page, { x: 1430, y: 330 }, { x: child.x + 30, y: 640 });

    const frameBottomEdge = FRAME.y2 - 3; // indicator thickness (3px), flush with the raw frame edge
    const oldBugLocation = child.y + 1;

    expect(isDropIndicatorBlue(await readPixelColor(page, child.x + 30, frameBottomEdge))).toBe(true);
    expect(isDropIndicatorBlue(await readPixelColor(page, child.x + 30, oldBugLocation))).toBe(false);

    await page.mouse.up();
  });
});
