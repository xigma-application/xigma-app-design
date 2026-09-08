import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const ROW_FRAME = { x1: 600, x2: 840, y1: 150, y2: 250 };

const setFlowHorizontal = async (page: Page): Promise<void> => {
  await page.locator('[data-test-toggle-button-group="flow"]').getByLabel('Horizontal', { exact: true }).click();
};

const setHorizontalGap = async (page: Page, gap: number): Promise<void> => {
  const gapInput = page.locator('[data-test-text-field-input="gap"]').first();

  await gapInput.click();
  await gapInput.fill(String(gap));
  await gapInput.press('Enter');
};

// same helper as reorder.spec.ts / rotated-frame.spec.ts
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const selectTheFrame = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [frameId] = pages[activePageId].rootOrder;

    store.dispatch(setSelection([frameId]));
  });

const getFrameGeometry = (page: Page): Promise<{ horizontalGap: number }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;

    return activePage.nodes[frameId] as unknown as { horizontalGap: number };
  });

const selectAutoGap = async (page: Page): Promise<void> => {
  await page.locator('[aria-label="Horizontal gap options"]').first().click();
  await page.getByText('Auto', { exact: true }).click();
};

const getChildrenX = (page: Page): Promise<number[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

    return frame.childIds.map((childId) => (activePage.nodes[childId] as unknown as { x: number }).x);
  });

test.describe('auto-layout — gap handles', () => {
  test('dragging the horizontal gap handle grows the shared gap and reflows the children', async ({ page }) => {
    const designPage = new DesignPage(page);

    // a 240x100 frame, no gap, two 60x60 children flush at world x 600 / 660
    await designPage.goto('e2e-test-auto-layout-gap-handles');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 2; index += 1) {
      await designPage.drawRectangle(1400, 160, 1460, 220);
      await dragInto(page, { x: 1430, y: 190 }, { x: ROW_FRAME.x2 - 15, y: 200 });
    }

    // dragging the last rectangle in left it selected, not the frame — the handles only ever
    // show up while a single auto-layout frame is selected, so it must be reselected first
    await selectTheFrame(page);

    const before = await getFrameGeometry(page);

    expect(before.horizontalGap).toBe(0);

    // hover the handle (arms it in the drop-target engine), then drag it 40px to the right — the
    // handle sits at the midpoint of the zero-width gap between the two children, (660, 180)
    await page.mouse.move(660, 180);
    await page.mouse.down();
    await page.mouse.move(700, 180, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();

    const after = await getFrameGeometry(page);

    expect(after.horizontalGap).toBe(40);
  });

  test('holding Shift while dragging the gap handle snaps the value to the nearest multiple of 10', async ({ page }) => {
    const designPage = new DesignPage(page);

    // a 240x100 frame, no gap, two 60x60 children flush at world x 600 / 660
    await designPage.goto('e2e-test-auto-layout-gap-handles-shift-snap');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 2; index += 1) {
      await designPage.drawRectangle(1400, 160, 1460, 220);
      await dragInto(page, { x: 1430, y: 190 }, { x: ROW_FRAME.x2 - 15, y: 200 });
    }

    await selectTheFrame(page);

    // drag the handle 44px to the right (a non-multiple-of-10 delta) with Shift held
    await page.mouse.move(660, 180);
    await page.mouse.down();
    await page.keyboard.down('Shift');
    await page.mouse.move(704, 180, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.keyboard.up('Shift');

    const after = await getFrameGeometry(page);

    expect(after.horizontalGap).toBe(40);
  });

  test('dragging the gap handle past 0 sets a negative gap, with no lower clamp', async ({ page }) => {
    const designPage = new DesignPage(page);

    // a 240x100 frame, no gap, two 60x60 children flush at world x 600 / 660
    await designPage.goto('e2e-test-auto-layout-gap-handles-negative-drag');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 2; index += 1) {
      await designPage.drawRectangle(1400, 160, 1460, 220);
      await dragInto(page, { x: 1430, y: 190 }, { x: ROW_FRAME.x2 - 15, y: 200 });
    }

    await selectTheFrame(page);

    // drag the handle 30px to the LEFT, past the zero-gap point it used to clamp at
    await page.mouse.move(660, 180);
    await page.mouse.down();
    await page.mouse.move(630, 180, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();

    const after = await getFrameGeometry(page);

    expect(after.horizontalGap).toBe(-30);
  });

  test('typing a negative gap in the RightPanel field is accepted, with no lower clamp', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-gap-handles-negative-input');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);

    await setHorizontalGap(page, -25);

    expect((await getFrameGeometry(page)).horizontalGap).toBe(-25);
  });

  test('switching gap to auto distributes children evenly, and live-redistributes them as the frame resizes', async ({ page }) => {
    const designPage = new DesignPage(page);

    // a 240x100 frame, no gap, two 60x60 children flush at world x 600 / 660
    await designPage.goto('e2e-test-auto-layout-gap-handles-auto');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 2; index += 1) {
      await designPage.drawRectangle(1400, 160, 1460, 220);
      await dragInto(page, { x: 1430, y: 190 }, { x: ROW_FRAME.x2 - 15, y: 200 });
    }

    await selectTheFrame(page);
    await selectAutoGap(page);

    // 240-wide content box, two 60-wide children — the single gap becomes the full 120px leftover
    const beforeResize = await getChildrenX(page);

    expect(beforeResize).toEqual([600, 780]);

    // drag the frame's right-edge handle 40px further right (240 -> 280 wide)
    await page.mouse.move(840, 200);
    await page.mouse.down();
    await page.mouse.move(880, 200, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();

    // 280-wide content box, same two 60-wide children — the gap grows to the new 160px leftover
    const afterResize = await getChildrenX(page);

    expect(afterResize).toEqual([600, 820]);
  });
});
