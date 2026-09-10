import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// Grid auto-layout: the cell math (track sizing, placement order, gaps, padding, hug, spanning,
// per-cell alignment) is pinned exhaustively by the unit suite under
// src/store/design/utils/autoLayout/computeGridLayoutPositions/, and the panel widget (preview tile,
// count inputs, 12x8 pick matrix) by ColumnAlignmentLayout/GridArea/**. What only a real browser
// proves is the wiring: the Flow toggle's "Grid" button and the GridArea popover controls
// dispatching into the store, syncAutoLayoutChildren running its grid branch, and the canvas
// repainting — the same round-trip rationale as flow.spec.ts.

const FRAME = { x1: 600, x2: 1100, y1: 150, y2: 700 };

const flowGroup = (page: Page): Locator => page.locator('[data-test-toggle-button-group="flow"]');

const setFlow = async (page: Page, option: 'Grid' | 'Horizontal'): Promise<void> => {
  await flowGroup(page).getByLabel(option, { exact: true }).click();
};

const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const selectFrameRow = async (page: Page): Promise<void> => {
  await page.locator('[class*="Tree__row_"]').filter({ hasText: 'Frame' }).first().click();
};

type TChildBox = { x: number; y: number };

const getChildren = (page: Page): Promise<TChildBox[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

    return frame.childIds.map((childId) => {
      const node = activePage.nodes[childId] as unknown as { x: number; y: number };

      return { x: Math.round(node.x), y: Math.round(node.y) };
    });
  });

const readColumnCount = (page: Page): Promise<number | undefined> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;

    return (activePage.nodes[frameId] as unknown as { gridColumnCount?: number }).gridColumnCount;
  });

const unique = (values: number[]): number[] => [...new Set(values)];

test.describe('auto-layout — Grid flow', () => {
  // each test draws a frame plus several dragged-in children before it can assert — heavier than the
  // 30s default, especially under parallel load
  test.describe.configure({ timeout: 60_000 });

  test('the Grid flow button lays the frame’s children into a two-column grid, and round-trips through Horizontal', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-flow');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2); // auto-selects the frame
    await expect(flowGroup(page)).toBeVisible();

    // four children, each drawn off to the side and dragged in through the real drop path
    for (const targetY of [250, 300, 350, 400]) {
      await designPage.drawRectangle(1400, targetY, 1460, targetY + 60);
      await dragInto(page, { x: 1430, y: targetY + 30 }, { x: 800, y: 400 });
    }

    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // switching to Grid seeds a default of two columns
    expect(await readColumnCount(page)).toBe(2);

    const grid = await getChildren(page);

    expect(grid).toHaveLength(4);

    const columnXs = unique(grid.map(({ x }) => x));
    const rowYs = unique(grid.map(({ y }) => y));

    expect(columnXs).toHaveLength(2);
    expect(rowYs).toHaveLength(2);
    // reading order fills row 0 left-to-right, then row 1
    expect(grid[0].y).toBe(grid[1].y);
    expect(grid[2].y).toBe(grid[3].y);
    expect(grid[2].y).toBeGreaterThan(grid[0].y);
    expect(grid[0].x).toBe(grid[2].x);
    expect(grid[1].x).toBe(grid[3].x);
    expect(grid[1].x).toBeGreaterThan(grid[0].x);

    // Horizontal collapses the grid into a single row...
    await setFlow(page, 'Horizontal');
    const row = await getChildren(page);

    expect(unique(row.map(({ y }) => y))).toHaveLength(1);

    // ...and returning to Grid restores the exact same cell coordinates
    await setFlow(page, 'Grid');
    expect(await getChildren(page)).toEqual(grid);
  });

  test('the Grid panel widget drives the column count via its input and its pick matrix', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-panel');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    for (const targetY of [250, 320, 390, 460]) {
      await designPage.drawRectangle(1400, targetY, 1450, targetY + 40);
      await dragInto(page, { x: 1425, y: targetY + 20 }, { x: 800, y: 400 });
    }

    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    expect(unique((await getChildren(page)).map(({ x }) => x))).toHaveLength(2);

    // open the popover and type a new column count into its Columns field
    await page.locator('[data-test-grid-area]').click();

    const columnsField = page.getByLabel('Columns', { exact: true });

    await columnsField.fill('3');
    await columnsField.blur();

    await expect.poll(() => readColumnCount(page)).toBe(3);
    expect(unique((await getChildren(page)).map(({ x }) => x))).toHaveLength(3);

    // the popover stays open — its 12x8 pick matrix sets both dimensions at once
    await page.locator('[data-value="2.2"]').click();

    await expect.poll(() => readColumnCount(page)).toBe(2);
    // back to two columns; the row count still grows to fit all six children
    expect(unique((await getChildren(page)).map(({ x }) => x))).toHaveLength(2);
  });

  test('a selected grid frame draws its cell slots on the canvas, reflowing them when the column count changes', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-slots');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2); // auto-selects the frame
    await expect(flowGroup(page)).toBeVisible();

    const safeArea = await designPage.canvasSafeArea();
    const beforeGrid = await page.screenshot({ clip: safeArea });

    await setFlow(page, 'Grid');
    await page.waitForTimeout(150);
    const withGrid = await page.screenshot({ clip: safeArea });

    // the slot overlay is the only thing that changed — an empty frame has no children to lay out
    expect(withGrid.equals(beforeGrid)).toBe(false);

    await page.locator('[data-test-grid-area]').click();
    const columnsField = page.getByLabel('Columns', { exact: true });

    await columnsField.fill('6');
    await columnsField.blur();
    await expect.poll(() => readColumnCount(page)).toBe(6);

    await page.keyboard.press('Escape'); // close the popover so it doesn't cover the canvas
    await page.waitForTimeout(150);
    const withMoreColumns = await page.screenshot({ clip: safeArea });

    expect(withMoreColumns.equals(withGrid)).toBe(false);
  });

  test('dragging an element over a grid cell highlights the target slot, and dropping nests it stretched to the cell', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-drop');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    // one child already inside, then switch the frame to Grid
    await designPage.drawRectangle(1400, 250, 1460, 310);
    await dragInto(page, { x: 1430, y: 280 }, { x: 800, y: 400 });
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // a second rectangle out on the canvas, to drag into the grid
    await designPage.drawRectangle(1400, 600, 1470, 660);

    const safeArea = await designPage.canvasSafeArea();
    const beforeHover = await page.screenshot({ clip: safeArea });

    await page.mouse.move(1435, 630);
    await page.mouse.down();
    await page.mouse.move(FRAME.x1 + 90, FRAME.y1 + 70, { steps: 12 });
    await page.waitForTimeout(150);
    const duringHover = await page.screenshot({ clip: safeArea });

    // the hovered slot lights up and the dragged element drops to half opacity
    expect(duringHover.equals(beforeHover)).toBe(false);

    await page.mouse.up();
    await page.waitForTimeout(150);

    const dropped = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };
      const last = activePage.nodes[frame.childIds[frame.childIds.length - 1]] as unknown as {
        heightSizingMode?: string;
        widthSizingMode?: string;
      };

      return { childCount: frame.childIds.length, heightSizingMode: last.heightSizingMode, widthSizingMode: last.widthSizingMode };
    });

    expect(dropped.childCount).toBe(2);
    expect(dropped.widthSizingMode).toBe('fill');
    expect(dropped.heightSizingMode).toBe('fill');
  });

  test('dropping against the near edge of an occupied cell inserts there and pushes the trailing children forward', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-insert');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    // two children dragged in, then switched to a two-column grid: they sit at (0,0) and (1,0)
    for (const targetY of [250, 320]) {
      await designPage.drawRectangle(1400, targetY, 1460, targetY + 40);
      await dragInto(page, { x: 1430, y: targetY + 20 }, { x: 800, y: 400 });
    }

    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // a third rectangle, dropped against the LEFT edge of the occupied second cell — its left
    // neighbour is occupied too, so this is an insertion, not a plain cell drop
    await designPage.drawRectangle(1400, 500, 1460, 540);

    const cellOneLeftEdge = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 2;

    await page.mouse.move(1430, 520);
    await page.mouse.down();
    await page.mouse.move(cellOneLeftEdge + 12, FRAME.y1 + 60, { steps: 12 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(150);

    const layout = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[]; gridAutoPlacement?: boolean };
      const read = (id: string): { column?: number; row?: number; x: number; y: number } => {
        const node = activePage.nodes[id] as unknown as {
          gridColumnAnchorIndex?: number;
          gridRowAnchorIndex?: number;
          x: number;
          y: number;
        };

        return { column: node.gridColumnAnchorIndex, row: node.gridRowAnchorIndex, x: Math.round(node.x), y: Math.round(node.y) };
      };

      return {
        gridAutoPlacement: frame.gridAutoPlacement,
        inserted: read(frame.childIds[2]),
        pushed: read(frame.childIds[1]),
      };
    });

    // the frame switched to manual placement; the dropped node took cell (1,0)
    expect(layout.gridAutoPlacement).toBe(false);
    expect(layout.inserted.column).toBe(1);
    expect(layout.inserted.row).toBe(0);
    // the child that used to sit there was pushed into the next row
    expect(layout.pushed.column).toBe(0);
    expect(layout.pushed.row).toBe(1);
    expect(layout.pushed.y).toBeGreaterThan(layout.inserted.y);
  });
});
