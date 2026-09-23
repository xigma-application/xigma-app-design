import { test } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('debug frame coords', async ({ page }) => {
  const designPage = new DesignPage(page);
  await designPage.goto('e2e-test-debug-frame-coords');

  await designPage.drawFrame(700, 100, 1200, 500);

  const info = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page1 = pages[activePageId];
    const id = page1.rootOrder[page1.rootOrder.length - 1];

    return { canvasBox: document.querySelector('canvas')?.getBoundingClientRect(), node: page1.nodes[id], viewport: page1.viewport };
  });

  console.log('DEBUG_INFO', JSON.stringify(info, null, 2));
});
