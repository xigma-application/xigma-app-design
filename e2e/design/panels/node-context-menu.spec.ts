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
