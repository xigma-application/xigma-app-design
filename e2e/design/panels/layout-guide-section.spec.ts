import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const setSecondGuide = (page: Page, secondGuide: Record<string, unknown>): Promise<string[]> =>
  page.evaluate(async (guide) => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection, updateNodes } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [firstId, secondId] = pages[activePageId].rootOrder;
    const columns = { color: '#ff0000', count: 4, opacity: 10, type: 'columns' };

    store.dispatch(
      updateNodes([
        { changes: { layoutGuides: [columns] } as never, id: firstId },
        { changes: { layoutGuides: [{ ...columns, ...guide }] } as never, id: secondId },
      ]),
    );
    store.dispatch(setSelection([firstId, secondId]));

    return [firstId, secondId];
  }, secondGuide);

const readCounts = (page: Page, ids: string[]): Promise<(number | undefined)[]> =>
  page.evaluate(async (nodeIds) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return nodeIds.map((id) => (pages[activePageId].nodes[id] as unknown as { layoutGuides: { count?: number }[] }).layoutGuides[0].count);
  }, ids);

test.describe('Design panels — Layout guide section', () => {
  test('with two frames selected, guides of the same type show one row whose differing count shows Mixed and a typed count is set on both, while different types show the mixed content hint', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-layout-guide-multi');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 700, 300);
    await designPage.drawFrame(800, 200, 900, 300);

    const ids = await setSecondGuide(page, { count: 12 });

    // action
    await page.getByLabel('Layout guide settings').click();

    const countInput = page.getByLabel('Layout guide count');

    // result
    await expect(countInput).toHaveValue('Mixed');

    // action
    await countInput.click();
    await countInput.fill('6');
    await countInput.press('Enter');

    // result
    expect(await readCounts(page, ids)).toEqual([6, 6]);

    // action
    await page.keyboard.press('Escape');
    await setSecondGuide(page, { type: 'rows' });

    // result
    await expect(page.locator('[data-test-section="layout-guide"]').getByText('Click + to replace mixed content')).toBeVisible();
    await expect(page.getByLabel('Layout guide settings')).toHaveCount(0);
  });
});
