import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test.describe.configure({ mode: 'serial' });

// v1(900,300) -> v2(1000,300) -> v3(1000,400) -> v4(900,400) -> back onto v1, closing the loop — same
// shape/coordinates as the other vector/*.spec.ts files' own drawClosedSquare, kept local so this file
// has no cross-file dependency.
const drawClosedSquare = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1000, y: 300 },
    { x: 1000, y: 400 },
    { x: 900, y: 400 },
    { x: 900, y: 300 },
  ]);
};

type TReadPaint = { blendMode?: string; end?: { x: number; y: number }; start?: { x: number; y: number }; type: string } | undefined;

const readPaintedFacePaint = (page: Page): Promise<TReadPaint> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const [id] = state.design.vectorEditingNodeIds;
    const node = state.design.pages[state.design.activePageId].nodes[id] as {
      fillByKey?: Record<string, TReadPaint[]>;
      filledFaceKeys: string[];
    };
    const [key] = node.filledFaceKeys;

    return node.fillByKey?.[key]?.[0];
  });

test('painting a face with the Gradient tab open commits a real gradient paint, rotated by the rotate button, onto the face', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-paint-gradient');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');

  const before = await designPage.canvas.screenshot();

  // switch to the Gradient tab and rotate it once (0deg -> 90deg), then close the picker before painting
  await page.getByRole('button', { name: 'Paint' }).click();
  await page.getByText('Gradient', { exact: true }).click();
  await page.getByLabel('Rotate gradient').click();
  await page.getByRole('button', { name: 'Paint' }).click();

  await designPage.click(950, 350); // paint the whole square

  const after = await designPage.canvas.screenshot();

  // result — the painted face actually carries a real gradient paint, rotated top-to-bottom (angle 90)
  const paint = await readPaintedFacePaint(page);

  expect(paint?.type).toBe('gradient-linear');
  expect(paint?.start).toEqual({ x: 0.5, y: 0 });
  expect(paint?.end).toEqual({ x: 0.5, y: 1 });

  // result — the gradient actually rendered on the GPU, not just flat solid
  expect(after.equals(before)).toBe(false);
});

test('opening the Gradient tab and closing the picker without touching any stop still paints a real gradient', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-paint-gradient-tab-only');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');

  const before = await designPage.canvas.screenshot();

  // open the picker, switch to Gradient, and close it again without dragging/adding any stop
  await page.getByRole('button', { name: 'Paint' }).click();
  await page.getByText('Gradient', { exact: true }).click();
  await page.getByRole('button', { name: 'Paint' }).click();

  await designPage.click(950, 350); // paint the whole square

  const after = await designPage.canvas.screenshot();

  // result — merely opening the Gradient tab already committed the default gradient as the real paint
  const paint = await readPaintedFacePaint(page);

  expect(paint?.type).toBe('gradient-linear');
  expect(after.equals(before)).toBe(false);
});
