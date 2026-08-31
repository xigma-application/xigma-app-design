import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('"]" brings the selected node to the front and "[" sends it back, changing what overlaps', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-z-order-shortcut');
  await expect(designPage.canvas).toBeVisible();

  // two overlapping rectangles; the second drawn (B) sits on top of the first (A)
  await designPage.drawRectangle(700, 300, 820, 420);
  await designPage.drawRectangle(760, 360, 880, 480);

  // give A and B distinct fills — every rectangle shares the same default fill, so without this
  // the overlap region would render pixel-identical no matter which one is stacked on top
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [idA, idB] = pages[activePageId].rootOrder;

    store.dispatch(updateNode({ changes: { fill: '#FF0000' }, id: idA }));
    store.dispatch(updateNode({ changes: { fill: '#0000FF' }, id: idB }));
  });

  await designPage.click(1500, 700); // deselect
  await designPage.pointerMove(1500, 700); // neutral rest, no hover outline
  const bOnTop = await designPage.canvas.screenshot();

  // select A (its exposed top-left corner, clear of B) and bring it to the front
  await designPage.click(710, 310);
  await page.keyboard.press(']');
  await designPage.click(1500, 700);
  await designPage.pointerMove(1500, 700);
  const aOnTop = await designPage.canvas.screenshot();

  // the overlap region now shows A's fill instead of B's, so the two captures differ
  expect(aOnTop.equals(bOnTop)).toBe(false);

  // send A back again — it must return to pixel-identical to the original state
  await designPage.click(710, 310);
  await page.keyboard.press('[');
  await designPage.click(1500, 700);
  await designPage.pointerMove(1500, 700);
  const aBackAgain = await designPage.canvas.screenshot();

  expect(aBackAgain.equals(bOnTop)).toBe(true);
});
