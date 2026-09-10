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

type TGridState = { anchors: (number | undefined)[][]; childIds: string[]; gridAutoPlacement?: boolean };

const readGridState = (page: Page): Promise<TGridState> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[]; gridAutoPlacement?: boolean };

    return {
      anchors: frame.childIds.map((id) => {
        const node = activePage.nodes[id] as unknown as { gridColumnAnchorIndex?: number; gridRowAnchorIndex?: number };

        return [node.gridColumnAnchorIndex, node.gridRowAnchorIndex];
      }),
      childIds: frame.childIds,
      gridAutoPlacement: frame.gridAutoPlacement,
    };
  });

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

  test('dragging two already-placed, far-apart grid children together merges them into adjacent cells', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-reorder-merge');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    // four children dragged in, then switched to a three-column grid: reading order fills
    // (0,0) (1,0) (2,0) (0,1) — a full first row plus a single child alone in the second
    for (const targetY of [250, 320, 390, 460]) {
      await designPage.drawRectangle(1400, targetY, 1450, targetY + 40);
      await dragInto(page, { x: 1425, y: targetY + 20 }, { x: 800, y: 400 });
    }

    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await page.locator('[data-test-grid-area]').click();

    const columnsField = page.getByLabel('Columns', { exact: true });

    await columnsField.fill('3');
    await columnsField.blur();
    await expect.poll(() => readColumnCount(page)).toBe(3);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);

    const columnWidth = (FRAME.x2 - FRAME.x1) / 3;
    const rowHeight = (FRAME.y2 - FRAME.y1) / 2;
    const cellPoint = (column: number, row: number): { x: number; y: number } => ({
      x: FRAME.x1 + columnWidth * column + 20,
      y: FRAME.y1 + rowHeight * row + 15,
    });

    const first = cellPoint(0, 0); // reading index 0
    const third = cellPoint(2, 0); // reading index 2 — two columns away from the first, same row

    // select the pair sitting at opposite ends of row 0
    await designPage.click(first.x, first.y);
    await designPage.click(third.x, third.y, { shift: true });

    // drag the pair together, grabbed from the first, onto the mostly-empty second row
    await dragInto(page, first, cellPoint(1, 1));
    await page.waitForTimeout(150);

    const { anchors, gridAutoPlacement } = await readGridState(page);
    const draggedAnchors = anchors.filter((anchor) => anchor[0] !== undefined);

    // manual placement kicked in; the dragged pair — two columns apart before the drag — landed
    // on the same row in two ADJACENT columns, merged together instead of keeping their old gap
    expect(gridAutoPlacement).toBe(false);
    expect(draggedAnchors).toHaveLength(2);
    expect(draggedAnchors[0]?.[1]).toBe(draggedAnchors[1]?.[1]);
    expect(Math.abs((draggedAnchors[0]?.[0] ?? 0) - (draggedAnchors[1]?.[0] ?? 0))).toBe(1);
  });

  test('holding the modifier disables the grid drop mechanism entirely, leaving placement untouched', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-modifier-bypass');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    // two children dragged in, then switched to a two-column grid: (0,0) and (1,0)
    for (const targetY of [250, 320]) {
      await designPage.drawRectangle(1400, targetY, 1460, targetY + 40);
      await dragInto(page, { x: 1430, y: targetY + 20 }, { x: 800, y: 400 });
    }

    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    const before = await readGridState(page);

    const columnWidth = (FRAME.x2 - FRAME.x1) / 2;
    const firstCell = { x: FRAME.x1 + 20, y: FRAME.y1 + 15 };
    const secondCell = { x: FRAME.x1 + columnWidth + 20, y: FRAME.y1 + 15 };

    await designPage.click(firstCell.x, firstCell.y);

    // grab the first child and drag it across the grid while holding the modifier the whole time
    await page.mouse.move(firstCell.x, firstCell.y);
    await page.mouse.down();
    await page.keyboard.down('Control');
    await page.mouse.move(secondCell.x, secondCell.y, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.keyboard.up('Control');
    await page.waitForTimeout(150);

    // no grid mode engaged at all — placement, order and auto-placement flag stay exactly as they were
    expect(await readGridState(page)).toEqual(before);
  });

  test('a grid child being dragged rides the cursor like a ghost, instead of snapping back to its cell', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-drag-ghost');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    // two children dragged in, then switched to a two-column grid: (0,0) and (1,0)
    for (const targetY of [250, 320]) {
      await designPage.drawRectangle(1400, targetY, 1460, targetY + 40);
      await dragInto(page, { x: 1430, y: targetY + 20 }, { x: 800, y: 400 });
    }

    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    const firstCell = { x: FRAME.x1 + 20, y: FRAME.y1 + 15 };
    const safeArea = await designPage.canvasSafeArea();

    await designPage.click(firstCell.x, firstCell.y);

    // grab the child and hold it in place — this is the frozen "snapped to its cell" position if
    // the drag were merely re-syncing live x/y through the (grid-managed) layout engine
    await page.mouse.move(firstCell.x, firstCell.y);
    await page.mouse.down();
    await page.mouse.move(firstCell.x + 15, firstCell.y + 15, { steps: 5 });
    await page.waitForTimeout(150);
    const atFirstOffset = await page.screenshot({ clip: safeArea });

    // keep moving, well within the same cell (no new slot is highlighted) — a real ghost still
    // rides the cursor here; a layout-resync-frozen node would render identically to the shot above
    await page.mouse.move(firstCell.x + 60, firstCell.y + 45, { steps: 5 });
    await page.waitForTimeout(150);
    const atSecondOffset = await page.screenshot({ clip: safeArea });

    await page.mouse.up();

    expect(atSecondOffset.equals(atFirstOffset)).toBe(false);
  });

  test('shrinking the column count repacks a manually anchored child instead of leaving it overlapping another', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-resize-repack');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // drag two rectangles into specific cells of the 2-column grid — this anchors both explicitly
    await designPage.drawRectangle(1400, 250, 1450, 290);
    await dragInto(page, { x: 1425, y: 270 }, { x: FRAME.x1 + 60, y: FRAME.y1 + 60 }); // column 0

    await designPage.drawRectangle(1400, 400, 1450, 440);
    await dragInto(page, { x: 1425, y: 420 }, { x: FRAME.x1 + 320, y: FRAME.y1 + 60 }); // column 1

    const readAnchors = (): Promise<{ column?: number; row?: number }[]> =>
      page.evaluate(async () => {
        const { store } = await import('/src/store/index.ts');
        const { activePageId, pages } = store.getState().design;
        const activePage = pages[activePageId];
        const [frameId] = activePage.rootOrder;
        const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

        return frame.childIds.map((id) => {
          const node = activePage.nodes[id] as unknown as { gridColumnAnchorIndex?: number; gridRowAnchorIndex?: number };

          return { column: node.gridColumnAnchorIndex, row: node.gridRowAnchorIndex };
        });
      });

    expect(await readAnchors()).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
    ]);

    // shrink to a single column via the panel — re-select the frame, since the last drop left the
    // dropped rectangle selected instead
    await selectFrameRow(page);
    await page.locator('[data-test-grid-area]').click();
    const columnsField = page.getByLabel('Columns', { exact: true });

    await columnsField.fill('1');
    await columnsField.blur();
    await expect.poll(() => readColumnCount(page)).toBe(1);
    await page.keyboard.press('Escape');

    // the first child keeps its cell; the second no longer fits at column 1 and drops into row 1 — not overlapping
    await expect.poll(readAnchors).toEqual([
      { column: 0, row: 0 },
      { column: 0, row: 1 },
    ]);
  });
});
