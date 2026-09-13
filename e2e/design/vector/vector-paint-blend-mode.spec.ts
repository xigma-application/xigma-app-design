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

const readToolPaintBlendMode = (page: Page): Promise<string | undefined> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();

    return state.design.pages[state.design.activePageId].paint.blendMode;
  });

const readPaintedFaceBlendMode = (page: Page): Promise<string | undefined> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const state = store.getState();
    const [id] = state.design.vectorEditingNodeIds;
    const node = state.design.pages[state.design.activePageId].nodes[id] as {
      fillByKey?: Record<string, { blendMode?: string }[]>;
      filledFaceKeys: string[];
    };
    const [key] = node.filledFaceKeys;

    return node.fillByKey?.[key]?.[0]?.blendMode;
  });

test('picking a blend mode in the Paint tool commits it onto the painted face, and the picker resets to Normal for the next stroke', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-paint-blend-mode');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquare(designPage);
  await designPage.selectVectorEditMoveTool();
  await page.keyboard.press('Shift+B');

  const before = await designPage.canvas.screenshot();

  // pick Multiply from the face blend mode menu, then close the picker before painting
  await page.getByRole('button', { name: 'Paint' }).click();
  await page.getByLabel('Apply blend mode to face').click();
  await page.getByText('Multiply', { exact: true }).click();
  await page.getByRole('button', { name: 'Paint' }).click();

  await designPage.click(950, 350); // paint the whole square

  const after = await designPage.canvas.screenshot();

  // result — the painted face actually carries the picked blend mode, and it visibly changed the render
  expect(await readPaintedFaceBlendMode(page)).toBe('multiply');
  expect(after.equals(before)).toBe(false);

  // result — the tool's own picker is back to Normal, ready for the next stroke
  expect(await readToolPaintBlendMode(page)).toBe('normal');
});
