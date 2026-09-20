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

    // action: dragging the X label scrubs its value
    const xLabel = page.locator('[class*="EffectSettingsPanel_"]').getByText('X', { exact: true });
    const xBox = (await xLabel.boundingBox())!;

    await page.mouse.move(xBox.x + xBox.width / 2, xBox.y + xBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(xBox.x + xBox.width / 2 + 30, xBox.y + xBox.height / 2, { steps: 6 });
    await page.mouse.up();

    // result
    await expect.poll(async () => (await readNode(page, id)).effects?.[0].x).toBeGreaterThan(0);

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

  test('an inner shadow is drawn inside the rectangle along the edge away from its offset, follows its values, and disappears when hidden', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-inner-shadow-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.mouse.move(1750, 900);

    const clip = { height: 180, width: 220, x: 690, y: 190 };
    const readChannels = async (x: number, y: number): Promise<number[]> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));
      const index = ((y - clip.y) * png.width + (x - clip.x)) * 4;

      return [png.data[index], png.data[index + 1], png.data[index + 2]];
    };
    const readLuma = async (x: number, y: number): Promise<number> => (await readChannels(x, y))[0];

    // result — with no effect the top edge and the center are the same grey
    const centerLuma = await readLuma(800, 280);

    expect(Math.abs((await readLuma(800, 203)) - centerLuma)).toBeLessThan(4);

    // action
    await addEffect(page, 'Inner shadow');

    // result — the default shadow (y offset 4) darkens the top edge, not the bottom one or the center
    await expect.poll(async () => centerLuma - (await readLuma(800, 203))).toBeGreaterThan(20);
    expect(Math.abs((await readLuma(800, 357)) - centerLuma)).toBeLessThan(6);
    expect(Math.abs((await readLuma(800, 280)) - centerLuma)).toBeLessThan(6);

    // action — a bigger blur spreads the shadow further into the rectangle
    const narrowLuma = await readLuma(800, 214);

    await page.getByLabel('Effect blur').fill('24');
    await page.getByLabel('Effect blur').press('Enter');

    // result
    await expect.poll(async () => (await readLuma(800, 214)) < narrowLuma - 4).toBe(true);

    // action — a colored shadow keeps its color while it fades out, without going dark or grey at the edge
    await page.getByLabel('Effect blur').fill('4');
    await page.getByLabel('Effect blur').press('Enter');

    const hexInput = page.getByLabel('Effect color').locator('..').getByRole('textbox').first();

    await hexInput.fill('ff0000');
    await hexInput.press('Enter');

    // result — every pixel of the fade keeps the red channel at least as high as the grey rectangle
    await expect.poll(async () => (await readChannels(800, 203))[1]).toBeLessThan(centerLuma - 20);
    expect((await readChannels(800, 203))[0]).toBeGreaterThanOrEqual(centerLuma - 3);
    expect((await readChannels(800, 205))[0]).toBeGreaterThanOrEqual(centerLuma - 3);

    // action — hiding the effect removes the shadow again
    await page.getByLabel('Hide effect').click();

    // result
    await expect.poll(async () => Math.abs((await readLuma(800, 203)) - centerLuma)).toBeLessThan(4);
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
