import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TRootFrame = { height: number; paddingLeft?: number; paddingRight?: number; rotation: number; width: number; x: number; y: number };

const readRootFrames = (page: Page): Promise<TRootFrame[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return activePage.rootOrder.map((id) => activePage.nodes[id] as unknown as TRootFrame);
  });

const drawTwoFramesAndSelectBoth = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawFrame(600, 200, 700, 300);
  await designPage.drawFrame(800, 250, 860, 310);
  await designPage.click(615, 188); // the first frame's label
  await designPage.click(815, 238, { shift: true }); // the second frame's label
};

test.describe('Position section with several frames selected', () => {
  test('X shows Mixed and a typed X moves both frames to it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-multi-position-x');
    await expect(designPage.canvas).toBeVisible();

    await drawTwoFramesAndSelectBoth(designPage);

    const xInput = page.locator('[data-test-text-field-input="x"]');

    await expect(xInput).toHaveValue('Mixed');

    await xInput.click();
    await xInput.fill('300');
    await xInput.press('Enter');

    const frames = await readRootFrames(page);

    expect(frames.map((frame) => frame.x)).toEqual([300, 300]);
  });

  test('a typed rotation turns both frames to it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-multi-position-rotation');
    await expect(designPage.canvas).toBeVisible();

    await drawTwoFramesAndSelectBoth(designPage);

    const rotationInput = page.locator('[data-test-text-field-input="rotation"]');

    await rotationInput.click();
    await rotationInput.fill('30');
    await rotationInput.press('Enter');

    const frames = await readRootFrames(page);

    expect(frames.map((frame) => frame.rotation)).toEqual([30, 30]);
  });

  test('Shift+H flips each frame on its own and swaps their places', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-multi-position-flip');
    await expect(designPage.canvas).toBeVisible();

    await drawTwoFramesAndSelectBoth(designPage);

    const [firstBefore, secondBefore] = await readRootFrames(page);
    const left = Math.min(firstBefore.x, secondBefore.x);
    const right = Math.max(firstBefore.x + firstBefore.width, secondBefore.x + secondBefore.width);

    await page.keyboard.press('Shift+H');

    const [firstAfter, secondAfter] = await readRootFrames(page);

    expect(firstAfter.x).toBe(left + right - firstBefore.x - firstBefore.width);
    expect(secondAfter.x).toBe(left + right - secondBefore.x - secondBefore.width);
  });

  test('W shows Mixed and a typed width resizes both frames to it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-multi-position-width');
    await expect(designPage.canvas).toBeVisible();

    await drawTwoFramesAndSelectBoth(designPage);

    const widthInput = page.locator('[data-test-text-field-input="width"]');

    await expect(widthInput).toHaveValue('Mixed');

    await widthInput.click();
    await widthInput.fill('150');
    await widthInput.press('Enter');

    const frames = await readRootFrames(page);

    expect(frames.map((frame) => frame.width)).toEqual([150, 150]);
  });

  test("a typed width below one frame's min leaves the field on Mixed instead of the typed number", async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-multi-position-width-min');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 700, 300);
    await designPage.drawFrame(800, 250, 900, 310);
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;

      store.dispatch(updateNode({ changes: { minWidth: 10 }, id: pages[activePageId].rootOrder[1] }));
    });
    await designPage.click(615, 188);
    await designPage.click(815, 238, { shift: true });

    const widthInput = page.locator('[data-test-text-field-input="width"]');

    await widthInput.click();
    await widthInput.fill('5');
    await widthInput.press('Enter');

    const frames = await readRootFrames(page);

    expect(frames.map((frame) => frame.width)).toEqual([5, 10]);
    await expect(widthInput).toHaveValue('Mixed');
  });
});
