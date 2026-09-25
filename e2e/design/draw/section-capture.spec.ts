import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readParentNames = (page: Page): Promise<Record<string, string | null>> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes } = pages[activePageId];

    return Object.fromEntries(Object.values(nodes).map((node) => [node.name, node.parentId ? nodes[node.parentId].name : null]));
  });

test('drawing a section collects the layers it fully covers only on release, leaving a partly covered one outside', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-capture-draw');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 760, 260);
  await designPage.drawRectangle(800, 200, 860, 260);
  await designPage.drawRectangle(880, 200, 940, 260);

  await designPage.selectToolFromDropdown('frame', 'Section');
  await designPage.pointerDown(650, 150);
  await designPage.pointerMove(900, 300);

  expect(await readParentNames(page)).toEqual({
    'Rectangle (1)': null,
    'Rectangle (2)': null,
    'Rectangle (3)': null,
    'Section (1)': null,
  });

  await designPage.pointerUp();

  expect(await readParentNames(page)).toEqual({
    'Rectangle (1)': 'Section (1)',
    'Rectangle (2)': 'Section (1)',
    'Rectangle (3)': null,
    'Section (1)': null,
  });
});

test('a section drawn inside a section collects only that section’s children, not the page layers over it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-capture-nested');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSection(500, 100, 1200, 600);
  await designPage.drawRectangle(600, 200, 660, 260);
  await designPage.drawRectangle(750, 200, 810, 260);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { moveNodes } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const sectionId = rootOrder.find((id) => nodes[id].type === 'section') as string;
    const firstRectangleId = rootOrder.find((id) => nodes[id].name === 'Rectangle (1)') as string;

    store.dispatch(moveNodes({ nodeIds: [firstRectangleId], targetIndex: 0, targetParentId: sectionId }));
  });

  await designPage.drawSection(550, 150, 900, 300);

  expect(await readParentNames(page)).toEqual({
    'Rectangle (1)': 'Section (2)',
    'Rectangle (2)': null,
    'Section (1)': null,
    'Section (2)': 'Section (1)',
  });
});

test('resizing a section collects the siblings it grows over and drops the children it shrinks away from', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-capture-resize');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(550, 150, 600, 200);
  await designPage.drawRectangle(750, 150, 800, 200);
  await designPage.drawSection(500, 100, 700, 300);

  expect(await readParentNames(page)).toMatchObject({ 'Rectangle (1)': 'Section (1)', 'Rectangle (2)': null });

  await designPage.pointerDown(700, 300);
  await designPage.pointerMove(850, 350);

  expect(await readParentNames(page)).toMatchObject({ 'Rectangle (2)': null });

  await designPage.pointerUp();

  expect(await readParentNames(page)).toMatchObject({ 'Rectangle (1)': 'Section (1)', 'Rectangle (2)': 'Section (1)' });

  await designPage.pointerDown(850, 350);
  await designPage.pointerMove(580, 350);
  await designPage.pointerUp();

  expect(await readParentNames(page)).toMatchObject({ 'Rectangle (1)': null, 'Rectangle (2)': null });
});
