import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const OUTER = { x1: 600, x2: 900, y1: 150, y2: 350 };

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

const readFrame = (page: Page): Promise<{ childIds: string[]; paddingLeft?: number; paddingRight?: number; x: number }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return activePage.nodes[activePage.rootOrder[0]] as { childIds: string[]; paddingLeft?: number; paddingRight?: number; x: number };
  });

const readChildX = (page: Page, childId: string): Promise<number> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return (pages[activePageId].nodes[id] as { x: number }).x;
  }, childId);

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

test.describe('auto-layout — Padding', () => {
  test('typing a merged horizontal padding pushes the first child right by that amount', async ({ page }) => {
    await buildHorizontalFrameWithChild(page, 'e2e-test-auto-layout-padding-merged');

    const before = await readFrame(page);
    const childBeforeX = await readChildX(page, before.childIds[0]);

    const input = page.locator('[data-test-text-field-input="padding-horizontal"]');

    await input.click();
    await input.fill('40');
    await input.press('Enter');

    const after = await readFrame(page);

    expect(after.paddingLeft).toBe(40);
    expect(await readChildX(page, before.childIds[0])).toBe(childBeforeX + 40);
  });

  test('a "10,50" merged value sets the two sides asymmetrically', async ({ page }) => {
    await buildHorizontalFrameWithChild(page, 'e2e-test-auto-layout-padding-split');

    const before = await readFrame(page);
    const childBeforeX = await readChildX(page, before.childIds[0]);

    const input = page.locator('[data-test-text-field-input="padding-horizontal"]');

    await input.click();
    await input.fill('10,50');
    await input.press('Enter');

    const after = await readFrame(page);

    expect(after.paddingLeft).toBe(10);
    expect(after.paddingRight).toBe(50);
    expect(await readChildX(page, before.childIds[0])).toBe(childBeforeX + 10);

    // the field now shows the split back to the user
    await expect(input).toHaveValue('10, 50');
  });

  test('the Individual padding toggle reveals four side inputs that move one side each', async ({ page }) => {
    await buildHorizontalFrameWithChild(page, 'e2e-test-auto-layout-padding-individual');

    await page.getByLabel('Individual padding').click();

    const topInput = page.locator('[data-test-text-field-input="padding-top"]');

    await expect(topInput).toBeVisible();
    await expect(page.locator('[data-test-text-field-input="padding-horizontal"]')).toHaveCount(0);

    await topInput.click();
    await topInput.fill('25');
    await topInput.press('Enter');

    const after = await readFrame(page);

    expect(after.paddingLeft ?? 0).toBe(0);
    await expect(page.locator('[data-test-text-field-input="padding-top"]')).toHaveValue('25');
  });
});
