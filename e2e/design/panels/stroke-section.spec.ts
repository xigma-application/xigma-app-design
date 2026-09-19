import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadablePaint = {
  crop?: { height: number; rotation: number; width: number; x: number; y: number };
  scaleMode?: string;
  type: string;
};
type TReadableNode = {
  strokeBrush?: string;
  strokeBrushDirection?: string;
  strokeBrushGap?: number;
  strokeBrushWiggle?: number;
  strokeDynamicFrequency?: number;
  strokeDynamicSmoothen?: number;
  strokeDynamicWiggle?: number;
  fills?: TReadablePaint[];
  strokeAlign?: string;
  strokeLeftWidth?: number;
  strokeProfile?: string;
  strokeProfileFlipped?: boolean;
  strokeSides?: string;
  strokeTopWidth?: number;
  strokeWidth?: number;
  strokes?: TReadablePaint[];
};
type TReadableImageEditor = { mode: string; nodeId: string; paintIndex: number; property?: string } | null;

const readImageEditor = (page: Page): Promise<TReadableImageEditor> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.imageEditor;
  });

const createSolidColorPngBuffer = async (width: number, height: number, [r, g, b]: [number, number, number]): Promise<Buffer> => {
  const { PNG } = await import('pngjs');
  const png = new PNG({ height, width });

  for (let index = 0; index < width * height; index += 1) {
    png.data[index * 4] = r;
    png.data[index * 4 + 1] = g;
    png.data[index * 4 + 2] = b;
    png.data[index * 4 + 3] = 255;
  }

  return PNG.sync.write(png);
};

const pickStrokeImageMode = async (page: Page, designPage: DesignPage, sessionName: string, mode: string): Promise<string> => {
  await designPage.goto(sessionName);
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 900, 360);
  await page.getByLabel('Add stroke').click();

  const id = await readFirstNodeId(page);

  await page.getByLabel('Stroke color').first().click();
  await page.getByLabel('Image', { exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({
    buffer: await createSolidColorPngBuffer(40, 40, [255, 0, 0]),
    mimeType: 'image/png',
    name: 'source.png',
  });

  const panel = page.locator('[class*="ColorPicker_"]:not([class*="ColorPicker__"])').first();

  await panel.locator('[class*="ImageFillModeRow__dropdown"]').click();
  await page.locator('[class*="DropdownOption__label"]', { hasText: mode }).click();

  return id;
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

test.describe('Design panels — Stroke section', () => {
  test('the stroke settings row (Position, Weight, advanced and individual buttons) appears only once a stroke exists and shows the defaults', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-settings-row');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    // result — no stroke yet, so no settings row
    await expect(page.getByLabel('Stroke weight')).toHaveCount(0);

    // action
    await page.getByLabel('Add stroke').click();

    // result — the default inside / 1px, plus both trailing buttons
    await expect(page.getByText('Weight', { exact: true })).toBeVisible();
    await expect(page.getByText('Inside', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Stroke weight')).toHaveValue('1');
    await expect(page.getByLabel('Advanced stroke settings')).toBeVisible();
    await expect(page.getByLabel('Individual strokes')).toBeVisible();

    const node = await readNode(page, await readFirstNodeId(page));

    expect(node.strokeAlign).toBe('inside');
    expect(node.strokeWidth).toBe(1);
  });

  test('typing a weight in the stroke settings row updates the stroke width and the field keeps the committed value', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-weight');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const weight = page.getByLabel('Stroke weight');

    // action
    await weight.fill('6');
    await weight.press('Enter');
    await weight.blur();

    // result
    expect((await readNode(page, id)).strokeWidth).toBe(6);
    await expect(page.getByLabel('Stroke weight')).toHaveValue('6');
  });

  test('choosing Outside then Center in the stroke Position dropdown writes strokeAlign to the node', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-position');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const position = page.locator('[class*="SectionColumn"] [class*="Dropdown"]').first();

    // action
    await position.click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Outside' }).click();

    // result
    expect((await readNode(page, id)).strokeAlign).toBe('outside');

    // action
    await position.click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Center' }).click();

    // result
    expect((await readNode(page, id)).strokeAlign).toBe('center');
  });

  test('the individual strokes menu limits the stroke to one side, Custom shows four fields with Mixed, and All takes the largest weight', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-sides');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const chooseSides = async (label: string): Promise<void> => {
      await page.getByLabel('Individual strokes').click();
      await page.locator('[class*="PopoverItem__label"]', { hasText: label }).click();
    };

    // action
    await chooseSides('Top');

    // result
    expect(await readNode(page, id)).toMatchObject({ strokeSides: 'top', strokeWidth: 1 });

    // action
    await chooseSides('Custom');
    await page.getByLabel('Stroke left weight').fill('9');
    await page.getByLabel('Stroke left weight').blur();

    // result
    await expect(page.getByLabel('Stroke weight')).toHaveValue('Mixed');
    expect(await readNode(page, id)).toMatchObject({ strokeLeftWidth: 9, strokeSides: 'custom', strokeTopWidth: 1 });

    // action
    await chooseSides('All');

    // result
    expect(await readNode(page, id)).toMatchObject({ strokeSides: 'all', strokeWidth: 9 });
    await expect(page.getByLabel('Stroke weight')).toHaveValue('9');
  });

  test('the advanced stroke settings button opens a panel with three tabs and Basic rows that are 32px high', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-settings-panel');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    // action
    await page.getByLabel('Advanced stroke settings').click();

    // result
    await expect(page.getByText('Stroke settings')).toBeVisible();
    await expect(page.getByText('Dynamic')).toBeVisible();
    await expect(page.getByText('Brush')).toBeVisible();

    const rows = page.locator('[class*="StrokeSettingsField__row"]');

    await expect(rows).toHaveCount(3);
    await expect(page.getByLabel('Miter angle', { exact: true })).toHaveCount(0);

    for (const box of await Promise.all([0, 1, 2].map((index) => rows.nth(index).boundingBox()))) {
      expect(box?.height).toBe(32);
    }

    const panelBox = await page.locator('[class*="StrokeSettingsPanel__body"]').boundingBox();
    const inputBoxes = await Promise.all(
      [0, 1, 2].map((index) => rows.nth(index).locator('[class*="StrokeSettingsField__control"]').boundingBox()),
    );

    for (const box of inputBoxes) {
      expect(box?.width).toBe(128);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((panelBox?.x ?? 0) + (panelBox?.width ?? 0) - 16);
    }

    await expect(page.getByLabel('Flip width profile')).toBeDisabled();

    // action: Wedge, Taper and Quarter taper are the flippable profiles, unlike the default Uniform
    await rows.nth(1).locator('button').first().click();
    await page.getByAltText('Quarter taper').click();

    // result
    await expect(page.getByLabel('Flip width profile')).toBeEnabled();

    // action: back to the default Uniform profile
    await rows.nth(1).locator('button').first().click();
    await page.locator('[class*="StrokeProfilePreview__uniform"]').last().click();

    // result
    await expect(page.getByLabel('Flip width profile')).toBeDisabled();

    // action
    await rows.nth(1).locator('button').first().click();

    // result
    await expect(page.locator('[class*="StrokeProfilePreview__image"]')).toHaveCount(5);
    await expect(page.locator('[class*="StrokeProfilePreview__uniform"]')).toHaveCount(2);
    await page.locator('[class*="StrokeProfilePreview__uniform"]').last().click();

    await expect(page.getByLabel('Dash', { exact: true })).toHaveCount(0);

    // action
    await rows.nth(0).locator('button').first().click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Dashed' }).click();

    // result
    await expect(page.getByLabel('Dash', { exact: true })).toHaveValue('20');
    await expect(page.getByLabel('Gap')).toHaveValue('20');
    await expect(page.getByText('Dash cap')).toBeVisible();

    const widthProfileRow = page.locator('[class*="StrokeSettingsField__row"]').filter({ hasText: 'Width profile' });

    await expect(widthProfileRow.locator('button').first()).toBeDisabled();
    await expect(page.getByLabel('Flip width profile')).toBeDisabled();

    // action
    await widthProfileRow.locator('[class*="tooltipTarget"]').hover();

    // result
    await expect(page.getByText("Can't use width profiles on dashed strokes").first()).toBeVisible();

    // action
    await rows.nth(0).locator('button').first().click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Custom' }).click();

    // result
    await expect(page.getByLabel('Dashes')).toHaveValue('20, 40, 60, 80');
    await expect(page.getByLabel('Gap')).toHaveCount(0);
    await expect(page.getByText('Dash cap')).toBeVisible();
    await expect(page.getByLabel('Flip width profile')).toBeDisabled();

    // action
    await page.getByText('Dynamic', { exact: true }).click();

    // result
    await expect(page.getByLabel('Frequency')).toHaveValue('75%');
    await expect(page.getByLabel('Wiggle')).toHaveValue('30%');
    await expect(page.getByLabel('Smoothen')).toHaveValue('50%');
    await expect(page.getByLabel('Individual strokes')).toBeHidden();
    await expect(page.getByLabel('Individual strokes')).toHaveCount(1);
    await expect(page.getByText('Center').first()).toBeVisible();

    // action
    await page.getByText('Brush', { exact: true }).click();

    // result
    await expect(page.getByText('Direction')).toBeVisible();
    await expect(page.getByText('Style')).toHaveCount(0);
    await expect(page.getByLabel('Individual strokes')).toBeHidden();

    const brushTrigger = page.locator('[class*="StrokeSettingsBrushTab__brush"] button').first();

    expect((await brushTrigger.boundingBox())?.height).toBe(32);
    expect((await page.locator('[class*="StrokeSettingsBrushTab__brush"]').boundingBox())?.height).toBe(44);

    // action
    await brushTrigger.click();

    // result
    await expect(page.getByText('Brushes', { exact: true })).toBeVisible();
    await expect(page.getByText('Stretch brushes')).toBeVisible();
    await expect(page.getByAltText('Blockbuster')).toBeVisible();

    const pickerList = page.locator('[class*="StrokeBrushPicker__list"]');
    const stretchHeader = page.getByText('Stretch brushes');

    await expect(stretchHeader).toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');

    // action: scrolling the list keeps the category header pinned to the top and draws its bottom border
    await pickerList.evaluate((element) => {
      element.scrollTop = 200;
    });

    // result
    await expect(stretchHeader).not.toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');
    expect(Math.abs(((await stretchHeader.boundingBox())?.y ?? 0) - ((await pickerList.boundingBox())?.y ?? 0))).toBeLessThanOrEqual(1);

    // action
    await pickerList.evaluate((element) => {
      element.scrollTop = 0;
    });

    // result
    await expect(stretchHeader).toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');

    const pickerBox = await page.locator('[class*="StrokeSettingsPanel__docked"]').boundingBox();
    const popoverBox = await page.locator('[class*="StrokeSettingsButtonPopover"]').boundingBox();

    expect(Math.abs((pickerBox?.x ?? 0) + (pickerBox?.width ?? 0) - (popoverBox?.x ?? 0))).toBeLessThanOrEqual(1);
    expect(
      Math.abs((pickerBox?.y ?? 0) + (pickerBox?.height ?? 0) - ((popoverBox?.y ?? 0) + (popoverBox?.height ?? 0))),
    ).toBeLessThanOrEqual(1);

    // action: clicking outside the brushes picker (but still inside the Stroke settings panel) closes only the picker
    await page.getByText('Stroke settings').click();

    // result
    await expect(page.getByText('Brushes', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Stroke settings')).toBeVisible();

    // action
    await brushTrigger.click();
    await page.getByAltText('Blockbuster').click();

    // result
    await expect(page.getByText('Brushes', { exact: true })).toHaveCount(0);
    await expect(page.getByAltText('Blockbuster').first()).toBeVisible();

    // action: pick a brush from the second (scatter) category, which swaps Direction for the scatter fields
    await brushTrigger.click();
    await expect(page.getByText('Scatter brushes')).toBeVisible();
    await page.getByAltText('Bubblegum').click();

    // result
    const strokeSettingsPopover = page.locator('[class*="StrokeSettingsButtonPopover"]');

    await expect(page.getByText('Direction')).toHaveCount(0);
    await expect(strokeSettingsPopover.getByLabel('Gap')).toHaveValue('45%');
    await expect(strokeSettingsPopover.getByLabel('Wiggle')).toHaveValue('0%');
    await expect(strokeSettingsPopover.getByLabel('Size jitter')).toHaveValue('0%');
    await expect(strokeSettingsPopover.getByLabel('Angular jitter')).toHaveValue('180°');
    await expect(strokeSettingsPopover.getByLabel('Rotation')).toHaveValue('179°');

    // action: hovering another option previews it live (value and form swap without a click)
    await brushTrigger.click();

    const pickerBoxBeforeHover = await page.locator('[class*="StrokeSettingsPanel__docked"]').boundingBox();

    await page.getByAltText('Blockbuster').hover();

    // result
    await expect(page.getByText('Direction')).toBeVisible();
    await expect(strokeSettingsPopover.getByLabel('Gap')).toHaveCount(0);

    // result: the form's height change (scatter fields -> Direction row) must not drag the picker with it
    const pickerBoxAfterHover = await page.locator('[class*="StrokeSettingsPanel__docked"]').boundingBox();

    expect(Math.abs((pickerBoxAfterHover?.x ?? 0) - (pickerBoxBeforeHover?.x ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((pickerBoxAfterHover?.y ?? 0) - (pickerBoxBeforeHover?.y ?? 0))).toBeLessThanOrEqual(1);

    // action: leaving the option without clicking it reverts the preview
    await page.getByText('Brushes', { exact: true }).hover();

    // result
    await expect(page.getByText('Direction')).toHaveCount(0);
    await expect(strokeSettingsPopover.getByLabel('Gap')).toHaveValue('45%');

    // action: closing the picker without clicking an option keeps the reverted (previous) brush
    await page.getByText('Stroke settings').click();

    // result
    await expect(page.getByText('Brushes', { exact: true })).toHaveCount(0);
    await expect(strokeSettingsPopover.getByLabel('Gap')).toHaveValue('45%');
  });

  test('picking a width profile actually redraws the stroke on the canvas, and flip redraws it again', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-width-profile-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const weight = page.getByLabel('Stroke weight');

    // action: a thick stroke makes a width-profile difference clearly visible on screen
    await weight.fill('24');
    await weight.press('Enter');
    await weight.blur();
    await page.getByLabel('Advanced stroke settings').click();

    const rows = page.locator('[class*="StrokeSettingsField__row"]');
    const widthProfileRow = rows.filter({ hasText: 'Width profile' });

    // result
    const uniformScreenshot = await designPage.canvas.screenshot();

    // action
    await widthProfileRow.locator('button').first().click();
    await page.getByAltText('Wedge').click();

    // result: a non-uniform profile actually changes the rendered stroke
    expect((await readNode(page, id)).strokeProfile).toBe('wedge');

    const wedgeScreenshot = await designPage.canvas.screenshot();

    expect(wedgeScreenshot.equals(uniformScreenshot)).toBe(false);

    // action: flip mirrors which end of the loop is thick, changing the render again
    await page.getByLabel('Flip width profile').click();

    // result
    expect((await readNode(page, id)).strokeProfileFlipped).toBe(true);

    const flippedScreenshot = await designPage.canvas.screenshot();

    expect(flippedScreenshot.equals(wedgeScreenshot)).toBe(false);
  });

  test('picking a stroke Join writes strokeJoin to the node and reshapes the outer corners of an outside stroke on the canvas', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-join-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const weight = page.getByLabel('Stroke weight');

    // action: a thick outside stroke makes the corner shape clearly visible
    await weight.fill('24');
    await weight.press('Enter');
    await weight.blur();
    await page.locator('[class*="SectionColumn"] [class*="Dropdown"]').first().click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Outside' }).click();
    await page.getByLabel('Advanced stroke settings').click();

    // result
    const miterScreenshot = await designPage.canvas.screenshot();

    // action
    await page.getByLabel('Round', { exact: true }).click();

    // result
    expect((await readNode(page, id)).strokeJoin).toBe('round');

    const roundScreenshot = await designPage.canvas.screenshot();

    expect(roundScreenshot.equals(miterScreenshot)).toBe(false);

    // action
    await page.getByLabel('Bevel', { exact: true }).click();

    // result
    expect((await readNode(page, id)).strokeJoin).toBe('bevel');

    const bevelScreenshot = await designPage.canvas.screenshot();

    expect(bevelScreenshot.equals(roundScreenshot)).toBe(false);
    expect(bevelScreenshot.equals(miterScreenshot)).toBe(false);
  });

  test('the Miter angle is shown only for the Miter join, clamps to 7.17-180 and a 90+ angle bevels the box corners on the canvas', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-miter-angle');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const weight = page.getByLabel('Stroke weight');

    await weight.fill('24');
    await weight.press('Enter');
    await weight.blur();
    await page.locator('[class*="SectionColumn"] [class*="Dropdown"]').first().click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Outside' }).click();
    await page.getByLabel('Advanced stroke settings').click();

    const miterAngle = page.getByLabel('Miter angle', { exact: true });

    // result: Miter is the default join, so the field is there with Figma's default angle
    await expect(miterAngle).toHaveValue('28.96°');

    const sharpScreenshot = await designPage.canvas.screenshot();

    // action: below the minimum clamps up
    await miterAngle.fill('1');
    await miterAngle.blur();

    // result
    await expect(miterAngle).toHaveValue('7.17°');
    expect((await readNode(page, id)).strokeMiterAngle).toBe(7.17);

    // action: above the maximum clamps down, and a 90+ angle bevels the 90 degree box corners
    await miterAngle.fill('500');
    await miterAngle.blur();

    // result
    await expect(miterAngle).toHaveValue('180°');
    expect((await readNode(page, id)).strokeMiterAngle).toBe(180);
    expect((await designPage.canvas.screenshot()).equals(sharpScreenshot)).toBe(false);

    // action: the field is only available for the Miter join
    await page.getByLabel('Round', { exact: true }).click();

    // result
    await expect(miterAngle).toHaveCount(0);
  });

  test('the dashed and custom stroke styles write their fields to the node and actually redraw the stroke as dashes on the canvas', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-dashes-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const weight = page.getByLabel('Stroke weight');

    await weight.fill('12');
    await weight.press('Enter');
    await weight.blur();
    await page.getByLabel('Advanced stroke settings').click();

    const styleRow = page.locator('[class*="StrokeSettingsField__row"]').filter({ hasText: 'Style' });

    // result
    const solidScreenshot = await designPage.canvas.screenshot();

    // action
    await styleRow.locator('button').first().click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Dashed' }).click();

    // result
    expect((await readNode(page, id)).strokeStyle).toBe('dashed');

    const dashedScreenshot = await designPage.canvas.screenshot();

    expect(dashedScreenshot.equals(solidScreenshot)).toBe(false);

    // action: a longer dash with the Gap following it changes the pattern
    const dash = page.getByLabel('Dash', { exact: true });

    await dash.fill('40');
    await dash.blur();

    // result
    expect((await readNode(page, id)).strokeDash).toBe(40);
    await expect(page.getByLabel('Gap')).toHaveValue('40');
    expect((await designPage.canvas.screenshot()).equals(dashedScreenshot)).toBe(false);

    // action: Gap edits on its own
    const gap = page.getByLabel('Gap');

    await gap.fill('10');
    await gap.blur();

    // result
    expect((await readNode(page, id)).strokeGap).toBe(10);

    const gapScreenshot = await designPage.canvas.screenshot();

    // action: a round cap rounds the dash ends
    await page.getByLabel('Round', { exact: true }).first().click();

    // result
    expect((await readNode(page, id)).strokeDashCap).toBe('round');
    expect((await designPage.canvas.screenshot()).equals(gapScreenshot)).toBe(false);

    // action: the Join reshapes the corners of the dashes too, once the stroke sits outside the shape
    const dashedRoundScreenshot = await designPage.canvas.screenshot();

    await page.getByLabel('Advanced stroke settings').click();
    await page.locator('[class*="SectionColumn"] [class*="Dropdown"]').first().click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Outside' }).click();
    await page.getByLabel('Advanced stroke settings').click();

    const outsideMiterScreenshot = await designPage.canvas.screenshot();

    await page.getByLabel('Round', { exact: true }).last().click();

    // result
    expect((await readNode(page, id)).strokeJoin).toBe('round');
    expect((await designPage.canvas.screenshot()).equals(outsideMiterScreenshot)).toBe(false);
    expect(outsideMiterScreenshot.equals(dashedRoundScreenshot)).toBe(false);

    // action: the custom style takes a dash, gap, dash, gap list
    await styleRow.locator('button').first().click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Custom' }).click();

    const dashes = page.getByLabel('Dashes');

    await dashes.fill('10, 20, 30, 20');
    await dashes.blur();

    // result
    expect((await readNode(page, id)).strokeDashes).toEqual([10, 20, 30, 20]);
  });

  test('the custom Dashes field steps every number with ArrowUp/Down while all are selected, and only the number at the caret otherwise, keeping focus', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-dashes-arrows');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);

    await page.getByLabel('Advanced stroke settings').click();
    await page.locator('[class*="StrokeSettingsField__row"]').filter({ hasText: 'Style' }).locator('button').first().click();
    await page.locator('[class*="DropdownOption__label"]', { hasText: 'Custom' }).click();

    const dashes = page.getByLabel('Dashes');

    await dashes.fill('8, 4, 6, 8');
    await dashes.blur();

    // action: click selects all, ArrowUp steps all four
    await dashes.click();
    await dashes.press('ArrowUp');

    // result
    await expect(dashes).toBeFocused();
    await expect(dashes).toHaveValue('9, 5, 7, 9');
    expect((await readNode(page, id)).strokeDashes).toEqual([9, 5, 7, 9]);

    // action: a caret on the second number steps only that number
    await dashes.press('Home');
    await dashes.press('ArrowRight');
    await dashes.press('ArrowRight');
    await dashes.press('ArrowRight');
    await dashes.press('ArrowRight');
    await dashes.press('ArrowDown');

    // result
    await expect(dashes).toHaveValue('9, 4, 7, 9');
    expect((await readNode(page, id)).strokeDashes).toEqual([9, 4, 7, 9]);
  });

  test('the Dynamic tab writes Frequency, Wiggle and Smoothen to the node with their limits and redraws the stroke as a wobbly line on the canvas', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-dynamic');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const weight = page.getByLabel('Stroke weight');

    await weight.fill('6');
    await weight.press('Enter');
    await weight.blur();

    const plainScreenshot = await designPage.canvas.screenshot();

    await page.getByLabel('Advanced stroke settings').click();
    await page.getByText('Dynamic', { exact: true }).click();

    // result: the dynamic mode alone already reshapes the stroke
    await expect.poll(async () => (await designPage.canvas.screenshot()).equals(plainScreenshot)).toBe(false);

    const dynamicScreenshot = await designPage.canvas.screenshot();
    const frequency = page.getByLabel('Frequency');
    const wiggle = page.getByLabel('Wiggle');
    const smoothen = page.getByLabel('Smoothen');

    // action
    await wiggle.fill('600');
    await wiggle.blur();
    await frequency.fill('5000');
    await frequency.blur();
    await smoothen.fill('250');
    await smoothen.blur();

    // result
    expect(await readNode(page, id)).toMatchObject({ strokeDynamicFrequency: 2000, strokeDynamicSmoothen: 100, strokeDynamicWiggle: 600 });
    await expect(frequency).toHaveValue('2000%');
    await expect(smoothen).toHaveValue('100%');
    expect((await designPage.canvas.screenshot()).equals(dynamicScreenshot)).toBe(false);

    // action: ArrowUp steps the Wiggle live and keeps the field focused
    await wiggle.click();
    await wiggle.press('ArrowUp');

    // result
    await expect(wiggle).toBeFocused();
    await expect(wiggle).toHaveValue('601%');
    expect((await readNode(page, id)).strokeDynamicWiggle).toBe(601);
  });

  test('the Brush tab writes the brush, direction and scatter values to the node and redraws the stroke on the canvas, with the width profile applied', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-stroke-section-brush');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add stroke').click();

    const id = await readFirstNodeId(page);
    const weight = page.getByLabel('Stroke weight');

    await weight.fill('14');
    await weight.press('Enter');
    await weight.blur();

    const plainScreenshot = await designPage.canvas.screenshot();

    await page.getByLabel('Advanced stroke settings').click();
    await page.getByText('Brush', { exact: true }).click();

    // result: the brush mode alone already redraws the stroke as a stretched brush
    await expect.poll(async () => (await designPage.canvas.screenshot()).equals(plainScreenshot)).toBe(false);

    const heistRight = await designPage.canvas.screenshot();

    // action: the opposite direction runs the brush the other way round the loop
    await page.locator('[class*="StrokeSettingsButtonPopover"]').getByLabel('Left').click();

    // result
    expect((await readNode(page, id)).strokeBrushDirection).toBe('left');
    expect((await designPage.canvas.screenshot()).equals(heistRight)).toBe(false);

    // action: the width profile reshapes the brush stroke too
    const heistLeft = await designPage.canvas.screenshot();

    await page.locator('[class*="StrokeSettingsField__row"]').filter({ hasText: 'Width profile' }).locator('button').first().click();
    await page.getByAltText('Wedge').click();

    // result
    expect((await designPage.canvas.screenshot()).equals(heistLeft)).toBe(false);

    // action: pick a scatter brush and change its Gap
    const brushTrigger = page.locator('[class*="StrokeSettingsBrushTab__brush"] button').first();

    await brushTrigger.click();
    await page.getByAltText('Bubblegum').click();

    // result
    expect((await readNode(page, id)).strokeBrush).toBe('bubblegum');

    const scatterDefault = await designPage.canvas.screenshot();
    const gap = page.getByLabel('Gap');

    await gap.fill('500');
    await gap.blur();

    // result
    expect(await readNode(page, id)).toMatchObject({ strokeBrush: 'bubblegum', strokeBrushGap: 500 });
    await expect(gap).toHaveValue('500%');
    expect((await designPage.canvas.screenshot()).equals(scatterDefault)).toBe(false);

    // action: ArrowUp steps the Wiggle live and keeps the field focused
    const wiggle = page.getByLabel('Wiggle');

    await wiggle.click();
    await wiggle.press('ArrowUp');

    // result
    await expect(wiggle).toBeFocused();
    await expect(wiggle).toHaveValue('1%');
    expect((await readNode(page, id)).strokeBrushWiggle).toBe(1);
  });

  test('the Tile mode of an image stroke arms the image editor for the strokes, not the fills', async ({ page }) => {
    const designPage = new DesignPage(page);
    const id = await pickStrokeImageMode(page, designPage, 'e2e-test-stroke-section-image-tile', 'Tile');

    // result
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'tile', nodeId: id, paintIndex: 0, property: 'strokes' });

    const node = await readNode(page, id);

    expect(node.strokes![0]).toMatchObject({ scaleMode: 'tile', type: 'image' });
    expect(node.fills![0].type).not.toBe('image');
  });

  test('the Crop mode of an image stroke seeds a crop on the stroke and dragging the image moves it, leaving the fills alone', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);
    const id = await pickStrokeImageMode(page, designPage, 'e2e-test-stroke-section-image-crop', 'Crop');

    // result — the editor targets the strokes and a crop was seeded on the stroke paint only
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 0, property: 'strokes' });

    const seeded = await readNode(page, id);

    expect(seeded.strokes![0].crop).toBeDefined();
    expect(seeded.fills![0].crop).toBeUndefined();

    // action — drag the image inside the frame
    await designPage.pointerDown(800, 280);
    await designPage.pointerMove(830, 300);
    await designPage.pointerUp();

    // result
    const moved = await readNode(page, id);

    expect(moved.strokes![0].crop!.x).toBe(seeded.strokes![0].crop!.x + 30);
    expect(moved.strokes![0].crop!.y).toBe(seeded.strokes![0].crop!.y + 20);
    expect(moved.fills![0].crop).toBeUndefined();
  });
});
