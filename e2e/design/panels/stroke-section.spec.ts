import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadablePaint = {
  crop?: { height: number; rotation: number; width: number; x: number; y: number };
  scaleMode?: string;
  type: string;
};
type TReadableNode = {
  fills?: TReadablePaint[];
  strokeAlign?: string;
  strokeLeftWidth?: number;
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

    const rows = page.locator('[class*="StrokeSettingsBasicTab__row"]');

    await expect(rows).toHaveCount(4);

    for (const box of await Promise.all([0, 1, 2, 3].map((index) => rows.nth(index).boundingBox()))) {
      expect(box?.height).toBe(32);
    }

    const panelBox = await page.locator('[class*="StrokeSettingsPanel__body"]').boundingBox();
    const inputBoxes = await Promise.all(
      [0, 1, 2, 3].map((index) => rows.nth(index).locator('[class*="StrokeSettingsBasicTab__control"]').boundingBox()),
    );

    for (const box of inputBoxes) {
      expect(box?.width).toBe(128);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((panelBox?.x ?? 0) + (panelBox?.width ?? 0) - 16);
    }

    await expect(page.getByLabel('Flip width profile')).toBeDisabled();

    // action
    await rows.nth(1).locator('button').first().click();

    // result
    await expect(page.locator('[class*="StrokeProfilePreview__image"]')).toHaveCount(5);
    await expect(page.locator('[class*="StrokeProfilePreview__uniform"]')).toHaveCount(2);
    await page.locator('[class*="StrokeProfilePreview__uniform"]').last().click();

    // action
    await page.getByText('Brush').click();

    // result
    await expect(page.getByText('Width profile')).toHaveCount(0);
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
