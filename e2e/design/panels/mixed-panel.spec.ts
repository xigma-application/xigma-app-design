import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('a selected frame and rectangle show the Mixed panel with their common sections and the component and wrap in section buttons', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-mixed-panel');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 200, 820, 320);
  await designPage.drawRectangle(900, 200, 1000, 300);
  await designPage.click(760, 260, { shift: true });

  await expect(page.locator('[data-test-component-header="mixed"]')).toBeVisible();
  await expect(page.locator('[data-test-section="fill"]')).toBeVisible();
  await expect(page.getByLabel('Component options', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Wrap in new section', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Use as mask', { exact: true })).toHaveCount(0);
});

test('several selected frames show the html tag, component options, mask and wrap in section buttons in that order', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-frame-header');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 200, 820, 320);
  await designPage.drawFrame(900, 200, 1020, 320);
  await designPage.click(760, 260, { shift: true });

  const header = page.locator('[data-test-component-header="frame"]');

  const labels = await header
    .locator('button[aria-label]')
    .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label')));

  expect(labels.slice(-5)).toEqual([
    'Toggle ready for dev status',
    'Create component',
    'Component options',
    'Use as mask',
    'Wrap in new section',
  ]);

  await header.getByLabel('Component options', { exact: true }).click();
  await expect(page.getByText('Create multiple components', { exact: true })).toBeVisible();
  await expect(page.getByText('Create component set', { exact: true })).toBeVisible();
});

test('frames from different parents keep only matching layers and the component button, and Create component explains above the toolbar why it cannot create a component', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-frame-different-parents');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 200, 900, 400);
  await designPage.drawFrame(740, 240, 820, 320);
  await designPage.drawFrame(1000, 200, 1100, 300);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const nested = Object.values(nodes).find((node) => node.parentId !== null);
    const loose = rootOrder.find((id) => (nodes[id] as { childIds: string[] }).childIds.length === 0);

    store.dispatch(setSelection([nested!.id, loose!]));
  });

  const header = page.locator('[data-test-component-header="frame"]');

  await expect(header.getByLabel('Component options', { exact: true })).toBeVisible();
  await expect(header.getByLabel('Use as mask', { exact: true })).toHaveCount(0);
  await expect(header.getByLabel('Toggle ready for dev status', { exact: true })).toHaveCount(0);
  await expect(header.getByLabel('Wrap in new section', { exact: true })).toHaveCount(0);

  await header.getByLabel('Create component', { exact: true }).click();
  await expect(page.getByText('Could not create component and instances from non-matching selection', { exact: true })).toBeVisible();
});

test('the Boolean button makes one Union per parent for rectangles from different parents', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-per-parent');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 200, 900, 400);
  await designPage.drawRectangle(740, 240, 820, 320);
  await designPage.drawRectangle(1000, 200, 1100, 300);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const rectangles = Object.values(pages[activePageId].nodes).filter((node) => node.type === 'rectangle');

    store.dispatch(setSelection(rectangles.map((node) => node.id)));
  });

  await page.getByLabel('Boolean operations', { exact: true }).click();

  const parentsOfUnions = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes } = pages[activePageId];

    return Object.values(nodes)
      .filter((node) => node.type === 'boolean')
      .map((node) => (node.parentId ? nodes[node.parentId].type : null))
      .sort();
  });

  expect(parentsOfUnions).toEqual(['frame', null].sort());
});

test('a rectangle and a Union selected together show mask, boolean and more actions with the component actions, and Boolean wraps both in a new Union', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-mixed-boolean');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawRectangle(760, 260, 880, 380);
  await designPage.drawRectangle(1000, 200, 1100, 300);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [first, second, third] = pages[activePageId].rootOrder;

    store.dispatch(setSelection([first, second]));
    store.dispatch(booleanNodes('union'));

    const union = store.getState().design.pages[activePageId].selectedIds[0];

    store.dispatch(setSelection([union, third]));
  });

  const header = page.locator('[data-test-component-header="mixed"]');

  await expect(header.getByLabel('Use as mask', { exact: true })).toBeVisible();
  await expect(header.getByLabel('Component options', { exact: true })).toHaveCount(0);
  await header.getByLabel('More actions', { exact: true }).click();
  await expect(page.getByText('Create component set', { exact: true })).toBeVisible();
  await expect(page.getByText('Wrap in new section', { exact: true })).toBeVisible();
  await header.getByLabel('More actions', { exact: true }).click();
  await header.getByLabel('Boolean operations', { exact: true }).click();

  const outer = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return rootOrder.map((id) => ({
      childTypes: (nodes[id] as { childIds: string[] }).childIds.map((childId) => nodes[childId].type).sort(),
      type: nodes[id].type,
    }));
  });

  expect(outer).toEqual([{ childTypes: ['boolean', 'rectangle'], type: 'boolean' }]);
});
