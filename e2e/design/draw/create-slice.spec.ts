import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TNodeState = { id: string; parentId: string | null; type: string; x: number; y: number };

const EMPTY_POINT = { x: 1500, y: 900 };

const readNodes = (page: Page): Promise<{ nodes: TNodeState[]; rootOrder: string[]; selectedIds: string[] }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder, selectedIds } = pages[activePageId];

    return { nodes: Object.values(nodes) as unknown as TNodeState[], rootOrder, selectedIds };
  });

const findSlice = async (page: Page): Promise<TNodeState | undefined> =>
  (await readNodes(page)).nodes.find((node) => node.type === 'slice');

test('drawing with the Slice tool adds a selected slice on top of the page, shows its panel and returns to the Move tool', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-draw');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSlice(700, 300, 1000, 600);

  const { rootOrder, selectedIds } = await readNodes(page);
  const slice = await findSlice(page);

  expect(slice).toMatchObject({ parentId: null, type: 'slice' });
  expect(selectedIds).toEqual([slice?.id]);
  expect(rootOrder[rootOrder.length - 1]).toBe(slice?.id);
  await expect(designPage.toolRadio('default')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-test-component-header="slice"]').getByText('Slice', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export Slice (1)' })).toBeVisible();
});

test('the plain "S" shortcut picks the Slice tool, distinct from Section\'s "Shift+S"', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-shortcut');
  await expect(designPage.canvas).toBeVisible();

  await page.keyboard.press('S');
  await expect(designPage.toolRadio('slice')).toHaveAttribute('aria-checked', 'true');

  await designPage.pointerDown(700, 300);
  await designPage.pointerMove(900, 500);
  await designPage.pointerUp();

  expect(await findSlice(page)).toBeDefined();
});

test('a click on a slice passes through to the layer under it, or to nothing', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-click-through');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(750, 350, 850, 450);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawSlice(700, 300, 1000, 600);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  const rectangle = (await readNodes(page)).nodes.find((node) => node.type === 'rectangle');

  await designPage.click(800, 400);
  expect((await readNodes(page)).selectedIds).toEqual([rectangle?.id]);

  await designPage.click(950, 550);
  expect((await readNodes(page)).selectedIds).toEqual([]);
});

test('a slice drawn over a frame stays on the page instead of going into the frame', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-no-nesting');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 250, 1100, 700);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawSlice(700, 300, 900, 500);

  expect((await findSlice(page))?.parentId).toBeNull();
});

test('a slice selected from the layers tree can be dragged on the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSlice(700, 300, 900, 500);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  await page.getByText('Slice (1)', { exact: true }).click();

  const before = await findSlice(page);

  await designPage.pointerDown(800, 400);
  await designPage.pointerMove(850, 450);
  await designPage.pointerUp();

  const after = await findSlice(page);

  expect(after?.x).toBe((before?.x ?? 0) + 50);
  expect(after?.y).toBe((before?.y ?? 0) + 50);
});

test('dragging a slice onto a frame does not put it into the frame', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-drag-into-frame');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(1000, 300, 1300, 600);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawSlice(600, 350, 700, 450);

  await designPage.pointerDown(650, 400);
  await designPage.pointerMove(1100, 400);
  await designPage.pointerMove(1150, 450);
  await designPage.pointerUp();

  const slice = await findSlice(page);

  expect(slice?.parentId).toBeNull();
  expect(slice?.x).toBeGreaterThan(1000);
});

test('two slices picked with a marquee show the Slice panel ready to export both', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-multi');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSlice(700, 300, 800, 400);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawSlice(900, 300, 1000, 400);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  await designPage.pointerDown(650, 250);
  await designPage.pointerMove(1050, 450);
  await designPage.pointerUp();

  expect((await readNodes(page)).selectedIds).toHaveLength(2);
  await expect(page.locator('[data-test-component-header="slice"]').getByText('Slice', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export 2 layers' })).toBeVisible();
});

test('hovering a slice row in the layers tree highlights its outline until the pointer leaves', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-tree-hover');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSlice(700, 300, 900, 500);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  const idle = await designPage.canvas.screenshot();

  await page.getByText('Slice (1)', { exact: true }).hover();

  const hovered = await designPage.canvas.screenshot();

  await page.mouse.move(5, 5);

  const left = await designPage.canvas.screenshot();

  expect(hovered.equals(idle)).toBe(false);
  expect(left.equals(idle)).toBe(true);
});

test('a layer dragged next to a slice snaps to its edge', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-snap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSlice(700, 300, 800, 400);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.drawRectangle(900, 300, 960, 360);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  await designPage.pointerDown(930, 330);
  await designPage.pointerMove(880, 330);
  await designPage.pointerMove(833, 330);
  await designPage.pointerUp();

  const { nodes } = await readNodes(page);
  const slice = nodes.find((node) => node.type === 'slice') as TNodeState & { width: number };
  const rectangle = nodes.find((node) => node.type === 'rectangle');

  expect(rectangle?.x).toBe(slice.x + slice.width);
});

test('a locked slice picked from the layers tree does not move when dragged on the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-locked');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSlice(700, 300, 900, 500);
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);

  const row = page.locator('[aria-selected]', { has: page.getByText('Slice (1)', { exact: true }) });

  await row.hover();
  await row.getByLabel('Lock layer').click();
  await page.getByText('Slice (1)', { exact: true }).click();

  const before = await findSlice(page);

  await designPage.pointerDown(800, 400);
  await designPage.pointerMove(850, 450);
  await designPage.pointerUp();

  const after = await findSlice(page);

  expect(after?.x).toBe(before?.x);
  expect(after?.y).toBe(before?.y);
});

test('a hidden slice has no export', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-slice-hidden-export');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSlice(700, 300, 900, 500);
  await expect(page.getByRole('button', { name: 'Export Slice (1)' })).toBeVisible();

  const row = page.locator('[aria-selected]', { has: page.getByText('Slice (1)', { exact: true }) });

  await row.hover();
  await row.getByLabel('Hide layer').click();

  await expect(page.locator('[data-test-component-header="slice"]').getByText('Slice', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export Slice (1)' })).toHaveCount(0);
});
