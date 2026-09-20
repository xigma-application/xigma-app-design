import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadableEffect = {
  blur: number;
  color: string;
  opacity: number;
  spread: number;
  type: string;
  visible?: boolean;
  x: number;
  y: number;
};
type TReadableNode = { effects?: TReadableEffect[] };

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

const addEffect = async (page: Page, label: string): Promise<void> => {
  await page.getByLabel('Add effect').click();
  await page.getByText(label, { exact: true }).last().click();
};

test.describe('Design panels — Effects section', () => {
  test('adding an inner shadow shows a row that opens a 240px settings panel whose values are saved on the node', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-section');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // action
    await addEffect(page, 'Inner shadow');

    // result
    expect((await readNode(page, id)).effects).toEqual([
      { blendMode: 'normal', blur: 4, color: '#000000', opacity: 25, spread: 0, type: 'innerShadow', x: 0, y: 4 },
    ]);

    const row = page.locator('[class*="EffectRow__trigger"]');

    await expect(row).toBeVisible();

    // result — choosing the effect opens its panel and highlights the row
    await expect(row).toHaveClass(/EffectRow__trigger--active/);

    const panel = page.locator('[class*="EffectSettingsPanel_"]').first();

    expect((await panel.boundingBox())?.width).toBe(240);
    await expect(page.getByLabel('Effect X offset')).toHaveValue('0');
    await expect(page.getByLabel('Effect Y offset')).toHaveValue('4');
    await expect(page.getByLabel('Effect blur')).toHaveValue('4');
    await expect(page.getByLabel('Effect spread')).toHaveValue('0');
    await expect(page.getByLabel('Effect color').locator('..').getByRole('textbox').first()).toHaveValue('000000');
    await expect(panel.getByText('Position')).toHaveCount(1);
    expect((await panel.locator('[class*="EffectSettingsField_"]').first().boundingBox())?.height).toBe(32);
    expect((await panel.locator('[class*="EffectSettingsField__control"]').first().boundingBox())?.width).toBe(136);

    // action
    await page.getByLabel('Effect Y offset').fill('8');
    await page.getByLabel('Effect Y offset').press('Enter');
    await page.getByLabel('Effect blur').fill('-3');
    await page.getByLabel('Effect blur').press('Enter');

    // result
    expect((await readNode(page, id)).effects?.[0]).toMatchObject({ blur: 0, y: 8 });

    // action: arrow keys step the number
    await page.getByLabel('Effect spread').focus();
    await page.keyboard.press('ArrowUp');

    // result
    await expect(page.getByLabel('Effect spread')).toHaveValue('1');

    // action: the header droplet sets the blend mode
    await page.getByLabel('Apply blend mode to effect').click();
    await page.getByText('Multiply', { exact: true }).click();

    // result
    expect((await readNode(page, id)).effects?.[0].blendMode).toBe('multiply');

    // action: the header menu changes the effect type
    await page.getByLabel('Change effect type').click();
    await page.getByText('Drop shadow', { exact: true }).last().click();

    // result
    expect((await readNode(page, id)).effects?.[0].type).toBe('dropShadow');

    // action
    await page.getByLabel('Close', { exact: true }).click();

    // result
    await expect(row).not.toHaveClass(/EffectRow__trigger--active/);
  });

  test('effects can be hidden and deleted, and dragging a row past another reorders them with a drop indicator', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-section-reorder');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await addEffect(page, 'Inner shadow');
    await addEffect(page, 'Drop shadow');

    // action
    const hideButtons = page.getByLabel('Hide effect');

    await hideButtons.nth(1).click();

    // result
    expect((await readNode(page, id)).effects?.map((effect) => effect.visible)).toEqual([undefined, false]);

    // action: drag the first row's handle past the second row
    const handles = page.getByLabel('Reorder effect');
    const fromBox = (await handles.nth(0).boundingBox())!;
    const toBox = (await handles.nth(1).boundingBox())!;

    await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height, { steps: 10 });

    // result
    await expect(page.locator('[class*="FillDropIndicator"]')).toBeVisible();

    await page.mouse.up();

    expect((await readNode(page, id)).effects?.map((effect) => effect.type)).toEqual(['dropShadow', 'innerShadow']);

    // action
    await page.getByLabel('Delete effect').first().click();

    // result
    expect((await readNode(page, id)).effects?.map((effect) => effect.type)).toEqual(['innerShadow']);
  });
});
