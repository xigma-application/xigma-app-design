import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test.describe('Design panels — Selection colors section', () => {
  test('with two frames selected, the section lists the colors of both frames, not only the first', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-selection-colors-multi');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 700, 300);
    await designPage.drawFrame(800, 200, 900, 300);
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { setSelection, updateNodes } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [firstId, secondId] = pages[activePageId].rootOrder;

      store.dispatch(
        updateNodes([
          { changes: { fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] }, id: firstId },
          { changes: { fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }] }, id: secondId },
        ]),
      );
      store.dispatch(setSelection([firstId, secondId]));
    });

    const section = page.locator('[data-test-section="selectionColors"]');

    // result
    await expect(section).toBeVisible();
    await expect(section.locator('input[value="ff0000"]')).toHaveCount(1);
    await expect(section.locator('input[value="0000ff"]')).toHaveCount(1);
  });
});
