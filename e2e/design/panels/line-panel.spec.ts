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

test('Edit object in the Line panel "…" menu enters point editing on the line, next to a disabled Offset vector', async ({ page }) => {
  await drawSelectedLine(page, 'e2e-test-line-panel-edit-object');

  await page.getByRole('button', { name: 'More actions' }).first().click();
  await expect(page.getByText('Offset vector', { exact: true })).toBeVisible();
  await expect(page.getByText('Create component', { exact: true })).toHaveCount(0);
  await page.getByText('Edit object', { exact: true }).click();

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

const readNodes = (page: Page): Promise<Record<string, unknown>[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return rootOrder.map((id) => nodes[id]) as unknown as Record<string, unknown>[];
  });

const selectAll = (page: Page, changes: Record<string, unknown>[] = []): Promise<void> =>
  page.evaluate(async (nodeChanges) => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection, updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    nodeChanges.forEach((changes, index) => store.dispatch(updateNode({ changes, id: rootOrder[index] })));
    store.dispatch(setSelection(rootOrder));
  }, changes);

test('two selected lines share the Line panel: different weights show Mixed and an end point picked applies to both', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-panel-several-lines');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawLine(800, 400, 1000, 400);
  await designPage.drawLine(800, 500, 1000, 500);
  await selectAll(page, [{ strokeWidth: 2 }, { strokeWidth: 5 }]);

  await expect(page.getByText('Start point')).toBeVisible();
  await expect(page.getByLabel('Stroke weight')).toHaveValue('Mixed');

  await page.getByRole('button', { name: 'None' }).nth(1).click();
  await page.getByText('Diamond arrow', { exact: true }).click();

  await expect.poll(async () => (await readNodes(page)).map((node) => node.endPoint)).toEqual(['diamondArrow', 'diamondArrow']);
});

test('a line selected with a rectangle shows the Mixed panel without Fill, and a typed stroke weight applies to both', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-panel-line-and-rectangle');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawRectangle(600, 300, 700, 400);
  await designPage.drawLine(800, 400, 1000, 400);
  await selectAll(page, [{ strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }]);

  await expect(page.getByText('Stroke', { exact: true })).toBeVisible();
  await expect(page.getByText('Fill', { exact: true })).toHaveCount(0);

  const weight = page.getByLabel('Stroke weight');

  await weight.fill('7');
  await weight.press('Enter');

  await expect.poll(async () => (await readNodes(page)).map((node) => node.strokeWidth)).toEqual([7, 7]);
});

test('an arrow drawn with the Arrow tool shows the Line panel titled Arrow, and turns back into Line once its arrowhead is removed', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-panel-arrow-title');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('rectangle', 'Arrow');
  await designPage.pointerDown(800, 400);
  await designPage.pointerMove(1000, 400);
  await designPage.pointerUp();

  const header = page.locator('[data-test-component-header="line"]');

  await expect(header.getByText('Arrow', { exact: true })).toBeVisible();
  await expect(page.getByText('Line arrow', { exact: true })).toBeVisible();

  await page.getByText('Line arrow', { exact: true }).click();
  await page.getByText('None', { exact: true }).last().click();

  await expect(header.getByText('Line', { exact: true })).toBeVisible();
});

test('an arrow selected with a plain line keeps the Line panel but is titled by its count', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-line-panel-arrow-and-line');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawLine(800, 400, 1000, 400);
  await designPage.drawLine(800, 500, 1000, 500);
  await selectAll(page, [{ endPoint: 'lineArrow' }]);

  const header = page.locator('[data-test-component-header="line"]');

  await expect(header.getByText('2 selected', { exact: true })).toBeVisible();
  await expect(page.getByText('Start point')).toBeVisible();
});

const updateLastNode = (page: Page, changes: Record<string, unknown>): Promise<void> =>
  page.evaluate(async (nodeChanges) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    store.dispatch(updateNode({ changes: nodeChanges, id: rootOrder[rootOrder.length - 1] }));
  }, changes);

test('an Inside position moves a line stroke to one side of the line', async ({ page }) => {
  await drawSelectedLine(page, 'e2e-test-line-panel-position');
  await updateLastNode(page, { strokeWidth: 10 });

  const aboveLine = { height: 4, width: 100, x: 850, y: 391 };
  const centered = await page.screenshot({ clip: aboveLine });

  await page.getByText('Center', { exact: true }).click();
  await page.getByText('Inside', { exact: true }).click();

  await expect.poll(async () => (await readLine(page)).strokeAlign).toBe('inside');
  await expect.poll(async () => (await page.screenshot({ clip: aboveLine })).equals(centered)).toBe(false);
});

test('a line draws dashed, width profile, dynamic and brush strokes differently from a solid one', async ({ page }) => {
  await drawSelectedLine(page, 'e2e-test-line-panel-stroke-modes');
  await updateLastNode(page, { strokeWidth: 10 });
  await new DesignPage(page).click(1500, 900);

  const lineArea = { height: 40, width: 220, x: 790, y: 380 };
  const solid = await page.screenshot({ clip: lineArea });

  for (const changes of [
    { strokeDash: 10, strokeGap: 10, strokeStyle: 'dashed' },
    { strokeProfile: 'wedge' },
    { strokeMode: 'dynamic' },
    { strokeMode: 'brush' },
  ]) {
    await updateLastNode(page, { strokeDash: undefined, strokeMode: 'basic', strokeProfile: 'uniform', strokeStyle: 'solid', ...changes });
    await expect.poll(async () => (await page.screenshot({ clip: lineArea })).equals(solid)).toBe(false);
  }
});

test('the line stroke settings open without a Join, and the Brush tab hides the start and end points', async ({ page }) => {
  await drawSelectedLine(page, 'e2e-test-line-panel-stroke-settings');

  await page.getByLabel('Advanced stroke settings').click();

  await expect(page.getByText('Width profile', { exact: true })).toBeVisible();
  await expect(page.getByText('Join', { exact: true })).toHaveCount(0);

  await page.getByText('Brush', { exact: true }).click();

  await expect.poll(async () => (await readLine(page)).strokeMode).toBe('brush');
  await expect(page.getByText('Start point')).toHaveCount(0);
});

test('clicking where an inside stroke is drawn, well off the line itself, selects the line', async ({ page }) => {
  const designPage = await drawSelectedLine(page, 'e2e-test-line-panel-inside-hit');

  await updateLastNode(page, { strokeAlign: 'inside', strokeWidth: 30 });
  await designPage.click(1500, 900);
  await expect(page.getByText('Start point')).toHaveCount(0);

  await designPage.click(900, 378);

  await expect(page.getByText('Start point')).toBeVisible();
});
