import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('right-clicking one layer of a section and rectangle selection builds the menu from the whole selection and hides both', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-node-context-menu-multi');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSection(550, 350, 750, 550);
  await designPage.click(1500, 900);
  await designPage.drawRectangle(900, 400, 960, 470);

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
  });

  await page.mouse.click(930, 435, { button: 'right' });

  await expect(page.getByRole('menuitem', { name: 'Show/Hide' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Flatten' })).toHaveCount(0);
  await expect(page.getByRole('menuitem', { name: 'Group selection' })).toHaveCount(0);

  await page.getByRole('menuitem', { name: 'Show/Hide' }).click();

  const hidden = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return rootOrder.map((id) => Boolean(nodes[id].hidden));
  });

  expect(hidden).toEqual([true, true]);
});

test('Remove mask on two selected mask layers removes both masks in one step', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-node-context-menu-remove-masks');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(600, 350, 700, 450);
  await page.keyboard.press('Alt+Control+M');
  await designPage.click(1500, 900);
  await designPage.drawRectangle(900, 350, 1000, 450);
  await page.keyboard.press('Alt+Control+M');

  const readMasks = (): Promise<{ maskIds: string[]; shapeIds: string[]; types: string[] }> =>
    page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const { nodes, rootOrder } = pages[activePageId];

      return {
        maskIds: rootOrder,
        shapeIds: rootOrder.map((id) => (nodes[id] as unknown as { childIds?: string[] }).childIds?.[0] ?? id),
        types: rootOrder.map((id) => nodes[id].type),
      };
    });

  const masked = await readMasks();

  expect(masked.types).toEqual(['mask', 'mask']);

  await page.evaluate(async (ids) => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');

    store.dispatch(setSelection(ids));
  }, masked.shapeIds);

  await page.mouse.click(650, 400, { button: 'right' });
  await page.getByRole('menuitem', { name: 'Remove mask' }).click();

  expect((await readMasks()).types).toEqual(['group', 'group']);

  await page.keyboard.press('Control+z');

  expect((await readMasks()).types).toEqual(['mask', 'mask']);
});
