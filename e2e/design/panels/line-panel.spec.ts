import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const lineEndArea = { height: 60, width: 60, x: 970, y: 370 };
const shadowArea = { height: 40, width: 240, x: 790, y: 405 };

const readLine = (page: Page): Promise<Record<string, unknown>> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[rootOrder.length - 1]] as unknown as Record<string, unknown>;
  });

const drawSelectedLine = async (page: Page, projectId: string): Promise<DesignPage> => {
  const designPage = new DesignPage(page);

  await designPage.goto(projectId);
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawLine(800, 400, 1000, 400);
  await expect(page.getByText('Start point')).toBeVisible();

  return designPage;
};

test('a selected line shows the Line panel, and picking an end point draws it on the line', async ({ page }) => {
  await drawSelectedLine(page, 'e2e-test-line-panel-endpoint');

  await expect(page.getByText('Line', { exact: true })).toBeVisible();
  await expect(page.getByText('Fill', { exact: true })).toHaveCount(0);

  const plain = await page.screenshot({ clip: lineEndArea });

  await page.getByRole('button', { name: 'None' }).nth(1).click();
  await page.getByText('Triangle arrow', { exact: true }).click();

  await expect.poll(async () => (await readLine(page)).endPoint).toBe('triangleArrow');
  await expect.poll(async () => (await page.screenshot({ clip: lineEndArea })).equals(plain)).toBe(false);
});

test('a drop shadow on a line is drawn under it', async ({ page }) => {
  await drawSelectedLine(page, 'e2e-test-line-panel-shadow');

  const plain = await page.screenshot({ clip: shadowArea });

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    store.dispatch(
      updateNode({
        changes: {
          effects: [{ blur: 4, color: '#000000', opacity: 100, spread: 0, type: 'dropShadow', visible: true, x: 0, y: 16 }],
          strokeWidth: 4,
        },
        id: rootOrder[rootOrder.length - 1],
      }),
    );
  });

  await expect.poll(async () => (await page.screenshot({ clip: shadowArea })).equals(plain)).toBe(false);
});

test('Edit objects in the Line panel "…" menu enters point editing on the line', async ({ page }) => {
  await drawSelectedLine(page, 'e2e-test-line-panel-edit-object');

  await page.getByRole('button', { name: 'More actions' }).first().click();
  await page.getByText('Edit objects', { exact: true }).click();

  await expect
    .poll(() =>
      page.evaluate(async () => {
        const { store } = await import('/src/store/index.ts');

        return store.getState().design.vectorEditingNodeIds.length;
      }),
    )
    .toBe(1);
  await expect.poll(async () => (await readLine(page)).type).toBe('vector');
});
