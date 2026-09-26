import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const IMAGE_REF = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

type TPaintState = { fills: unknown[][]; paintFill: unknown[] | null };

const readPaintState = (page: Page): Promise<TPaintState> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const [id] = state.design.vectorEditingNodeIds;
    const pageState = state.design.pages[state.design.activePageId];
    const node = pageState.nodes[id] as unknown as { fillByKey?: Record<string, unknown[]>; filledFaceKeys: string[] };

    return { fills: node.filledFaceKeys.map((key) => node.fillByKey?.[key] ?? []), paintFill: pageState.paintFill ?? null };
  });

test('the Paint tool on a vector filled with an image paints and clears areas with that image, until Solid is picked', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-paint-image-fill');
  await expect(designPage.canvas).toBeVisible();

  // before — a closed square in vector edit mode whose only area is filled with an image
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 300 },
    { x: 1000, y: 400 },
    { x: 900, y: 400 },
    { x: 900, y: 300 },
  ]);
  await designPage.selectVectorEditMoveTool();
  await page.evaluate(async (ref) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { getVectorFillsChange } = await import('/src/utils/canvas/vectorNetwork/getVectorFillsChange.ts');
    const state = store.getState();
    const [id] = state.design.vectorEditingNodeIds;
    const node = state.design.pages[state.design.activePageId].nodes[id];

    store.dispatch(
      updateNode({
        changes: getVectorFillsChange(node as never, [{ opacity: 100, ref, rotation: 0, scaleMode: 'fill', type: 'image' }]),
        id,
      }),
    );
  }, IMAGE_REF);

  const [imageFill] = (await readPaintState(page)).fills;

  // action — switch to the Paint tool
  await page.keyboard.press('Shift+B');

  // result — it paints with the image fill and shows its thumbnail
  expect((await readPaintState(page)).paintFill).toEqual(imageFill);
  await expect(page.locator('[class*="Color__thumbnail"]').first()).toBeVisible();

  // action — clear the area, then paint it again
  await designPage.click(950, 350);

  // result
  await expect.poll(async () => (await readPaintState(page)).fills).toEqual([]);

  // action
  await designPage.click(950, 350);

  // result — the area has the same image fill back
  await expect.poll(async () => (await readPaintState(page)).fills).toEqual([imageFill]);

  // action — the picker offers only Solid and Gradient; picking Solid leaves the image mode
  await page.getByRole('button', { name: 'Paint' }).click();

  await expect(page.getByRole('textbox', { name: 'Hex color' })).toHaveCount(0);

  const buttonBox = await page.getByRole('button', { name: 'Paint' }).boundingBox();
  const panelBox = await page.getByRole('dialog').boundingBox();

  expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(buttonBox!.y);
  expect(Math.abs(panelBox!.x + panelBox!.width / 2 - (buttonBox!.x + buttonBox!.width / 2))).toBeLessThanOrEqual(2);

  await page.getByText('Solid', { exact: true }).click();

  // result
  expect((await readPaintState(page)).paintFill).toBeNull();
});
