import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const OUTER = { x1: 600, x2: 900, y1: 150, y2: 350 }; // 300x200 frame, left edge x=600, vertical centre y=250

const flowGroup = (page: Page): ReturnType<Page['locator']> => page.locator('[data-test-toggle-button-group="flow"]');

const setFlowHorizontal = async (page: Page): Promise<void> => {
  await flowGroup(page).getByLabel('Horizontal', { exact: true }).click();
};

const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const selectLayersRow = async (page: Page, exactName: string): Promise<void> => {
  await page.locator('[class*="Tree__row_"]').filter({ hasText: exactName }).first().click();
};

const readFramePaddingLeft = (page: Page): Promise<number> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return (activePage.nodes[activePage.rootOrder[0]] as { paddingLeft?: number }).paddingLeft ?? 0;
  });

const readSelectedIds = (page: Page): Promise<string[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

const buildHorizontalFrameWithChild = async (page: Page, testName: string): Promise<DesignPage> => {
  const designPage = new DesignPage(page);

  await designPage.goto(testName);
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(OUTER.x1, OUTER.y1, OUTER.x2, OUTER.y2);
  await expect(flowGroup(page)).toBeVisible();
  await setFlowHorizontal(page);

  await designPage.drawRectangle(1400, 160, 1500, 210);
  await dragInto(page, { x: 1450, y: 185 }, { x: 700, y: 250 });

  await selectLayersRow(page, 'Frame (1)');

  return designPage;
};

test.describe('auto-layout — canvas padding handles', () => {
  test('dragging the zero-state left handle out from the edge sets the left padding to that distance', async ({ page }) => {
    const designPage = await buildHorizontalFrameWithChild(page, 'e2e-test-padding-handle-zero-drag');

    // grab the zero-padding handle's reach zone — it extends up to AUTO_LAYOUT_PADDING_ZERO_HANDLE_REACH_PX
    // (30) in from the left edge (x=600), vertically centred (y=250); grabbed comfortably inside that
    // reach rather than right on its own boundary
    await designPage.pointerMove(625, 250);

    await designPage.pointerDown(625, 250);
    await designPage.pointerMove(640, 250); // 40px in from the left edge (x=600)
    await designPage.pointerUp();

    expect(await readFramePaddingLeft(page)).toBe(40);
  });

  test('a zero-padding handle can also be grabbed well short of its own visual dot, not just right on it', async ({ page }) => {
    const designPage = await buildHorizontalFrameWithChild(page, 'e2e-test-padding-handle-edge-reach');

    // the handle's own visual position sits just outside the edge (x=600), but its reach extends
    // well inward — grab it partway in instead of at the small visual marker itself (not flush
    // against x=600, which is the frame's own resize-edge handle's own territory)
    await designPage.pointerMove(610, 250);

    await designPage.pointerDown(610, 250);
    await designPage.pointerMove(620, 250); // 20px in from the left edge
    await designPage.pointerUp();

    expect(await readFramePaddingLeft(page)).toBe(20);
  });

  test('dragging an already-padded left handle grows the padding by the drag delta', async ({ page }) => {
    const designPage = await buildHorizontalFrameWithChild(page, 'e2e-test-padding-handle-delta-drag');

    // first grab establishes a padding of 40 (absolute mode, from the zero state)
    await designPage.pointerMove(625, 250);
    await designPage.pointerDown(625, 250);
    await designPage.pointerMove(640, 250);
    await designPage.pointerUp();
    expect(await readFramePaddingLeft(page)).toBe(40);

    // the handle now sits centred in the padding band (x=620, halfway between the edge at 600 and the
    // content boundary at 640); dragging it a further 20px right should grow padding by that same
    // delta (delta mode, since the original value is > 0)
    await designPage.pointerMove(620, 250);
    await designPage.pointerDown(620, 250);
    await designPage.pointerMove(640, 250);
    await designPage.pointerUp();

    expect(await readFramePaddingLeft(page)).toBe(60);
  });

  test('the padding handles only render once the frame is both selected and hovered', async ({ page }) => {
    const designPage = await buildHorizontalFrameWithChild(page, 'e2e-test-padding-handle-visibility');

    await designPage.pointerMove(1400, 700); // rest well away from the frame
    const selectedOnly = await designPage.canvas.screenshot();

    await designPage.pointerMove(750, 250); // move onto the frame itself
    const selectedAndHovered = await designPage.canvas.screenshot();

    expect(selectedAndHovered.equals(selectedOnly)).toBe(false);
  });

  test('clicking a padding handle without dragging opens a value popup that sets the padding on Enter', async ({ page }) => {
    const designPage = await buildHorizontalFrameWithChild(page, 'e2e-test-padding-handle-click-popup');
    const selectedBefore = await readSelectedIds(page);

    // a plain click (no intervening move) on the zero-padding left handle, instead of a drag
    await designPage.pointerMove(610, 250);
    await designPage.pointerDown(610, 250);
    await designPage.pointerUp();

    const input = page.locator('[data-test-auto-layout-padding-value-input]');

    await expect(input).toBeVisible();
    await expect(input).toHaveValue('0');

    await input.fill('40');
    await input.press('Enter');

    await expect(input).toBeHidden();
    expect(await readFramePaddingLeft(page)).toBe(40);
    // committing the popup must not have cleared the frame's selection
    expect(await readSelectedIds(page)).toEqual(selectedBefore);
  });

  test('pressing Escape in the padding value popup cancels without changing the padding', async ({ page }) => {
    const designPage = await buildHorizontalFrameWithChild(page, 'e2e-test-padding-handle-click-popup-escape');

    await designPage.pointerMove(610, 250);
    await designPage.pointerDown(610, 250);
    await designPage.pointerUp();

    const input = page.locator('[data-test-auto-layout-padding-value-input]');

    await expect(input).toBeVisible();
    await input.fill('40');
    await input.press('Escape');

    await expect(input).toBeHidden();
    expect(await readFramePaddingLeft(page)).toBe(0);
  });

  test('clicking elsewhere on the canvas blurs the padding value popup and commits its value', async ({ page }) => {
    const designPage = await buildHorizontalFrameWithChild(page, 'e2e-test-padding-handle-click-popup-blur');
    const selectedBefore = await readSelectedIds(page);

    await designPage.pointerMove(610, 250);
    await designPage.pointerDown(610, 250);
    await designPage.pointerUp();

    const input = page.locator('[data-test-auto-layout-padding-value-input]');

    await expect(input).toBeVisible();
    await input.fill('25');

    // click elsewhere on the frame's own canvas area, away from the popup, to blur it
    await designPage.pointerMove(750, 300);
    await designPage.pointerDown(750, 300);
    await designPage.pointerUp();

    await expect(input).toBeHidden();
    expect(await readFramePaddingLeft(page)).toBe(25);
    expect(await readSelectedIds(page)).toEqual(selectedBefore);
  });
});
