import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadableNode = {
  cornerRadius?: number;
  cornerRadiusBottomLeft?: number;
  cornerRadiusBottomRight?: number;
  cornerRadiusTopLeft?: number;
  cornerRadiusTopRight?: number;
  cornerSmoothing?: number;
  hidden?: boolean;
  opacity?: number;
};

const readFirstNodeId = (page: Page): Promise<string> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].rootOrder[0];
  });

const readNode = (page: Page, id: string): Promise<TReadableNode> =>
  page.evaluate(async (nodeId) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes[nodeId] as TReadableNode;
  }, id);

test.describe('Design panels — Appearance section', () => {
  test('typing an opacity percentage commits it as a 0-1 fraction and dims the shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-appearance-opacity');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const before = await designPage.canvas.screenshot();
    const opacityInput = page.locator('[data-test-text-field-input="opacity"]');

    await opacityInput.click();
    await opacityInput.fill('30');
    await opacityInput.press('Enter');

    const id = await readFirstNodeId(page);

    expect((await readNode(page, id)).opacity).toBe(0.3);

    const after = await designPage.canvas.screenshot();

    expect(after.equals(before)).toBe(false);
  });

  test('typing a merged corner radius rounds all four corners the same', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-appearance-corner-radius-merged');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const cornerRadiusInput = page.locator('[data-test-text-field-input="corner-radius"]');

    await cornerRadiusInput.click();
    await cornerRadiusInput.fill('20');
    await cornerRadiusInput.press('Enter');

    const id = await readFirstNodeId(page);

    expect(await readNode(page, id)).toMatchObject({
      cornerRadius: 20,
      cornerRadiusBottomLeft: 20,
      cornerRadiusBottomRight: 20,
      cornerRadiusTopLeft: 20,
      cornerRadiusTopRight: 20,
    });
  });

  test('the Individual corner radius toggle reveals four fields that move one corner each and reports Mixed once split', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-appearance-corner-radius-individual');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Individual corner radius').click();

    const topLeftInput = page.locator('[data-test-text-field-input="corner-radius-top-left"]');

    await expect(topLeftInput).toBeVisible();
    await topLeftInput.click();
    await topLeftInput.fill('12');
    await topLeftInput.press('Enter');

    const id = await readFirstNodeId(page);
    const node = await readNode(page, id);

    expect(node.cornerRadiusTopLeft).toBe(12);
    expect(node.cornerRadiusTopRight ?? 0).toBe(0);

    // collapsing back to the merged view reports the now-uneven corners as Mixed
    await page.getByLabel('Individual corner radius').click();
    await expect(page.locator('[data-test-text-field-input="corner-radius"]')).toHaveValue('Mixed');
  });

  test('the Hide toggle hides the shape and swaps to the Show label', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-appearance-hide');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const before = await designPage.canvas.screenshot();

    await page.getByLabel('Hide', { exact: true }).click();

    const id = await readFirstNodeId(page);

    expect((await readNode(page, id)).hidden).toBe(true);

    const after = await designPage.canvas.screenshot();

    expect(after.equals(before)).toBe(false);
    await expect(page.getByLabel('Show', { exact: true })).toBeVisible();
  });

  test('setting a corner smoothing percentage commits it as a 0-1 fraction and reshapes a rounded corner', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-appearance-corner-smoothing');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const cornerRadiusInput = page.locator('[data-test-text-field-input="corner-radius"]');

    await cornerRadiusInput.click();
    await cornerRadiusInput.fill('40');
    await cornerRadiusInput.press('Enter');

    const before = await designPage.canvas.screenshot();

    await page.getByLabel('Individual corner radius').click();
    await page.getByLabel('Corner smoothing').click();

    const smoothingInput = page.locator('[data-test-text-field-input="corner-smoothing"]');

    await smoothingInput.click();
    await smoothingInput.fill('60');
    await smoothingInput.press('Enter');

    const id = await readFirstNodeId(page);

    expect((await readNode(page, id)).cornerSmoothing).toBe(0.6);

    const after = await designPage.canvas.screenshot();

    expect(after.equals(before)).toBe(false);
  });

  test("reducing a frame's opacity visually dims its child shape too", async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-appearance-opacity-cascade');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 150, 1000, 450);
    await designPage.drawRectangle(700, 200, 900, 360);

    const frameId = await readFirstNodeId(page);
    const before = await designPage.canvas.screenshot();

    await page.locator('[class*="Tree__row_"]').filter({ hasText: 'Frame' }).first().click();

    const opacityInput = page.locator('[data-test-text-field-input="opacity"]');

    await opacityInput.click();
    await opacityInput.fill('20');
    await opacityInput.press('Enter');

    expect((await readNode(page, frameId)).opacity).toBe(0.2);

    const after = await designPage.canvas.screenshot();

    expect(after.equals(before)).toBe(false);
  });
});
