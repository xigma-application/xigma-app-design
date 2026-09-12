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

const canvasTrackValueInput = (page: Page): Locator => page.locator('[class*="GridTrackValueLabelEditOverlay__input"]');

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

const openGridSettings = async (page: Page): Promise<void> => {
  await page.locator('[data-test-grid-area]').click();
  await page.getByRole('button', { name: 'Open grid settings' }).click();
  await expect(page.locator('[data-test-grid-settings-panel]')).toBeVisible();
};

const readRowCount = (page: Page): Promise<number | undefined> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const [frameId] = pages[activePageId].rootOrder;

    return (pages[activePageId].nodes[frameId] as unknown as { gridRowCount?: number }).gridRowCount;
  });

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

const readColumnTrack = (page: Page, index: number): Promise<{ mode?: string; value?: number } | undefined> =>
  page.evaluate(async (trackIndex) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const sizes = (activePage.nodes[frameId] as unknown as { gridColumnSizes?: { mode?: string; value?: number }[] }).gridColumnSizes;

    return sizes?.[trackIndex];
  }, index);

const readGridTrackSelection = (page: Page): Promise<{ axis?: string; frameId?: string; indices?: number[] } | null> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.gridTrackSelection ?? null;
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

  test('the Grid size popover opens anchored to the top-left corner of its trigger tile', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-popover-anchor');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    const trigger = page.locator('[data-test-grid-area]');

    await trigger.click();

    const popover = page.locator('[class*="GridAreaPanel"]');

    await expect(popover).toBeVisible();

    const triggerBox = await trigger.boundingBox();
    const popoverBox = await popover.boundingBox();

    // the popover overlays the panel from the trigger's own top-left corner, not flipped off to one side
    expect(Math.abs(popoverBox!.x - triggerBox!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(popoverBox!.y - triggerBox!.y)).toBeLessThanOrEqual(2);
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

    const droppedId = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const { rootOrder } = pages[activePageId];

      return rootOrder[rootOrder.length - 1];
    });

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

    const dropped = await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };
      const node = activePage.nodes[nodeId] as unknown as { heightSizingMode?: string; widthSizingMode?: string };

      return { childCount: frame.childIds.length, heightSizingMode: node.heightSizingMode, widthSizingMode: node.widthSizingMode };
    }, droppedId);

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

    const droppedId = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const { rootOrder } = pages[activePageId];

      return rootOrder[rootOrder.length - 1];
    });

    const cellOneLeftEdge = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 2;

    await page.mouse.move(1430, 520);
    await page.mouse.down();
    await page.mouse.move(cellOneLeftEdge + 12, FRAME.y1 + 60, { steps: 12 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(150);

    const layout = await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[]; gridAutoPlacement?: boolean };
      const read = (
        id: string,
      ): { column?: number; heightSizingMode?: string; row?: number; widthSizingMode?: string; x: number; y: number } => {
        const node = activePage.nodes[id] as unknown as {
          gridColumnAnchorIndex?: number;
          gridRowAnchorIndex?: number;
          heightSizingMode?: string;
          widthSizingMode?: string;
          x: number;
          y: number;
        };

        return {
          column: node.gridColumnAnchorIndex,
          heightSizingMode: node.heightSizingMode,
          row: node.gridRowAnchorIndex,
          widthSizingMode: node.widthSizingMode,
          x: Math.round(node.x),
          y: Math.round(node.y),
        };
      };

      return {
        childIds: frame.childIds,
        gridAutoPlacement: frame.gridAutoPlacement,
        inserted: read(nodeId),
        pushed: read(frame.childIds[2]),
      };
    }, droppedId);

    // automatic positioning stayed on: the dropped node took reading index 1 by reordering
    // childIds, not by an explicit anchor, and still stretches to fill its cell
    expect(layout.childIds[1]).toBe(droppedId);
    expect(layout.gridAutoPlacement).not.toBe(false);
    expect(layout.inserted.column).toBeUndefined();
    expect(layout.inserted.row).toBeUndefined();
    expect(layout.inserted.widthSizingMode).toBe('fill');
    expect(layout.inserted.heightSizingMode).toBe('fill');
    // the child that used to sit there was pushed into the next row by the auto-flow engine —
    // also without ever getting an explicit anchor
    expect(layout.pushed.column).toBeUndefined();
    expect(layout.pushed.row).toBeUndefined();
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

    // repositioning an already-placed child is blocked while automatic positioning is on — switch
    // to manual now, after the grid is already sized (that resize step itself still ran under
    // automatic positioning, same as a real drag-to-reposition would require)
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: frameId }));
    });

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

    // still in manual placement; the dragged pair — two columns apart before the drag — landed
    // on the same row in two ADJACENT columns, merged together instead of keeping their old gap
    expect(gridAutoPlacement).toBe(false);
    expect(draggedAnchors).toHaveLength(2);
    expect(draggedAnchors[0]?.[1]).toBe(draggedAnchors[1]?.[1]);
    expect(Math.abs((draggedAnchors[0]?.[0] ?? 0) - (draggedAnchors[1]?.[0] ?? 0))).toBe(1);
  });

  test('the automatic-positioning toggle only shows for Grid flow, and flips gridAutoPlacement on click', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-auto-placement-toggle');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);

    // not shown for any other flow
    await expect(page.getByLabel('Toggle automatic positioning')).not.toBeVisible();

    await setFlow(page, 'Grid');
    const toggle = page.getByLabel('Toggle automatic positioning');

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(
      await page.evaluate(async () => {
        const { store } = await import('/src/store/index.ts');
        const { activePageId, pages } = store.getState().design;
        const [frameId] = pages[activePageId].rootOrder;

        return (pages[activePageId].nodes[frameId] as unknown as { gridAutoPlacement?: boolean }).gridAutoPlacement;
      }),
    ).toBe(false);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('dragging an already-placed grid child leaves it untouched while automatic positioning is on, but repositions it once toggled off', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-auto-placement-blocks-drag');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    // one child dragged in, then switched to Grid: it auto-places into column 0
    await designPage.drawRectangle(1400, 250, 1460, 310);
    await dragInto(page, { x: 1430, y: 280 }, { x: 800, y: 400 });
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // two equal-width columns; the (small, still fixed-size) child sits near the top-left of
    // its own cell — same inset used by the other existing-grid-child drag tests in this file
    const cellHalfWidth = (FRAME.x2 - FRAME.x1) / 2;
    const firstCell = { x: FRAME.x1 + 20, y: FRAME.y1 + 15 };
    const secondCellEmptySpot = { x: FRAME.x1 + cellHalfWidth + 20, y: FRAME.y1 + 15 };

    const before = await getChildren(page);

    // select the child itself (not just the frame) before dragging it, same as any other
    // existing-grid-child drag in this file
    await designPage.click(firstCell.x, firstCell.y);

    // try to drag it into the (empty) second column while automatic positioning is still on
    // (the default) — the drag itself is a no-op, so the layout stays untouched
    await page.mouse.move(firstCell.x, firstCell.y);
    await page.mouse.down();
    await page.mouse.move(secondCellEmptySpot.x, secondCellEmptySpot.y, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(150);

    expect(await getChildren(page)).toEqual(before);

    // turn automatic positioning off, then the exact same drag actually repositions the child —
    // re-select the frame first, since the blocked drag attempt above left the child selected
    await selectFrameRow(page);
    await page.getByLabel('Toggle automatic positioning').click();
    await designPage.click(firstCell.x, firstCell.y);
    await page.mouse.move(firstCell.x, firstCell.y);
    await page.mouse.down();
    await page.mouse.move(secondCellEmptySpot.x, secondCellEmptySpot.y, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(150);

    expect(await getChildren(page)).not.toEqual(before);
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

    // manual placement, so the two drops below anchor explicitly instead of just reordering
    // childIds (which is what a drop does while automatic positioning is still on)
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: frameId }));
    });

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

  test('a rejected column count leaves the input showing the real grid instead of the typed value', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-rejected-input');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // six children (fixture setup, not the gesture under test) fill the default 2-column grid to
    // exactly 2x3, then rows are pinned Fixed — capacity is now exactly 6, with no slack
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      for (let index = 0; index < 6; index += 1) {
        store.dispatch(
          addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
        );

        const state = store.getState().design;
        const activePage = state.pages[state.activePageId];
        const rectId = activePage.rootOrder[activePage.rootOrder.length - 1];

        store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
      }

      store.dispatch(updateNode({ changes: { gridRowCount: 3 }, id: frameId }));
    });

    await selectFrameRow(page);
    await page.locator('[data-test-grid-area]').click();
    const columnsField = page.getByLabel('Columns', { exact: true });

    // 1 column x 3 fixed rows = 3 cells, short of the 6 children — the commit is rejected
    await columnsField.fill('1');
    await columnsField.blur();
    await page.waitForTimeout(150);

    expect(await readColumnCount(page)).toBe(2);
    await expect(columnsField).toHaveValue('2');
  });

  test('the Padding row is available for a grid frame and shifts its children the same way as linear layout', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-padding');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    for (const targetY of [250, 320]) {
      await designPage.drawRectangle(1400, targetY, 1450, targetY + 40);
      await dragInto(page, { x: 1425, y: targetY + 20 }, { x: 800, y: 400 });
    }

    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    const paddingInput = page.locator('[data-test-text-field-input="padding-horizontal"]');

    await expect(paddingInput).toBeVisible();

    const before = await getChildren(page);

    await paddingInput.click();
    await paddingInput.fill('40');
    await paddingInput.press('Enter');

    const after = await getChildren(page);

    expect(after[0].x).toBe(before[0].x + 40);
  });

  test('a grid child offers Fill container in its Width sizing menu, and stretches to its cell once selected', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-child-fill');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // a child added directly (not through the drop pipeline, which already sets Fill on its own)
    // so it lands auto-placed at (0,0) with the ordinary default Fixed sizing
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(
        addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
      );

      const state = store.getState().design;
      const activePage = state.pages[state.activePageId];
      const rectId = activePage.rootOrder[activePage.rootOrder.length - 1];

      store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
    });

    // click the child directly on canvas — it's fixed-sized (20x20) auto-placed at the top-left
    // of cell (0,0), i.e. the frame's own top-left corner (no padding/gap by default)
    await page.mouse.click(FRAME.x1 + 10, FRAME.y1 + 10);

    const widthMenuButton = page.getByLabel('Width sizing options');

    await expect(widthMenuButton).toBeVisible();
    await widthMenuButton.click();

    const fillOption = page.getByText('Fill container', { exact: true });

    await expect(fillOption).toBeVisible();
    await fillOption.click();

    const child = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

      return activePage.nodes[frame.childIds[0]] as unknown as { width: number; widthSizingMode?: string };
    });

    // the grid is 500px wide, 2 default columns, no gap/padding — a filling cell is 250px
    expect(child.widthSizingMode).toBe('fill');
    expect(child.width).toBe(250);
  });

  test('the shared Alignment widget moves a grid child within its own cell instead of setting a constraint', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-child-align');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // a lone fixed-size child, added directly — auto-placed at (0,0) of the 2-column grid, so its
    // single cell spans the full 250x550 (default fill tracks on both axes)
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(
        addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
      );

      const state = store.getState().design;
      const activePage = state.pages[state.activePageId];
      const rectId = activePage.rootOrder[activePage.rootOrder.length - 1];

      store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
    });

    await page.mouse.click(FRAME.x1 + 10, FRAME.y1 + 10);

    // defaults to top-left of the cell being pressed, before any click
    await expect(page.getByLabel('Align left')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Align top')).toHaveAttribute('aria-pressed', 'true');

    await page.getByLabel('Align right', { exact: true }).click();
    await page.getByLabel('Align bottom', { exact: true }).click();

    const child = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

      return activePage.nodes[frame.childIds[0]] as unknown as {
        alignment?: unknown;
        gridChildHorizontalAlign?: string;
        gridChildVerticalAlign?: string;
        x: number;
        y: number;
      };
    });

    expect(child.gridChildHorizontalAlign).toBe('right');
    expect(child.gridChildVerticalAlign).toBe('bottom');
    expect(child.alignment).toBeUndefined();
    // node x/y are world coordinates; the cell is 250x550 (2 fill columns x 1 fill row), the
    // child is a fixed 20x20, so it lands at the cell's bottom-right corner
    expect(child.x).toBe(FRAME.x1 + 250 - 20);
    expect(child.y).toBe(FRAME.y1 + 550 - 20);
  });

  test('switching a grid child to Absolute position lets it drag freely instead of snapping back to its old cell', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-child-absolute');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // a lone fixed-size child, added directly — auto-placed at cell (0,0)
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(
        addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
      );

      const state = store.getState().design;
      const activePage = state.pages[state.activePageId];
      const rectId = activePage.rootOrder[activePage.rootOrder.length - 1];

      store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
    });

    await page.mouse.click(FRAME.x1 + 10, FRAME.y1 + 10);
    await page.getByLabel('Ignore auto layout', { exact: true }).click();

    // drag it well away from cell (0,0), fully inside the frame
    await dragInto(page, { x: FRAME.x1 + 10, y: FRAME.y1 + 10 }, { x: FRAME.x1 + 300, y: FRAME.y1 + 300 });

    const afterDrag = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

      return activePage.nodes[frame.childIds[0]] as unknown as { x: number; y: number };
    });

    // it actually moved to the drop point (grabbed at its own centre, 10px in from its corner) —
    // not snapped back to its old cell position (the bug: the grid ghost mechanism, meant only for
    // grid-managed children, doesn't skip live dispatch, so nothing ever commits its new position)
    expect(afterDrag.x).toBe(FRAME.x1 + 300 - 10);
    expect(afterDrag.y).toBe(FRAME.y1 + 300 - 10);
  });

  test('the Column span field stretches a grid child across its cells, and refuses a span past the grid', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-child-span');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // a lone child, added directly — auto-placed at cell (0,0) of the default 2-column grid
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(
        addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
      );

      const state = store.getState().design;
      const activePage = state.pages[state.activePageId];
      const rectId = activePage.rootOrder[activePage.rootOrder.length - 1];

      store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
    });

    await page.mouse.click(FRAME.x1 + 10, FRAME.y1 + 10);

    // make it fill its cell, so a wider span shows up as a wider box
    await page.getByLabel('Width sizing options').click();
    await page.getByText('Fill container', { exact: true }).click();

    const columnSpanField = page.getByLabel('Column span', { exact: true });

    // span 2 — the child stretches across both columns of the 500px-wide grid
    await columnSpanField.fill('2');
    await columnSpanField.press('Enter');

    await expect
      .poll(() =>
        page.evaluate(async () => {
          const { store } = await import('/src/store/index.ts');
          const { activePageId, pages } = store.getState().design;
          const activePage = pages[activePageId];
          const [frameId] = activePage.rootOrder;
          const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };
          const child = activePage.nodes[frame.childIds[0]] as unknown as { gridColumnSpan?: number; width: number };

          return { span: child.gridColumnSpan, width: child.width };
        }),
      )
      .toEqual({ span: 2, width: 500 });

    // the grid only has 2 columns — typing 9 is refused and the field snaps back to 2
    await columnSpanField.fill('9');
    await columnSpanField.press('Enter');

    await expect(page.getByLabel('Column span', { exact: true })).toHaveValue('2');
    expect(
      await page.evaluate(async () => {
        const { store } = await import('/src/store/index.ts');
        const { activePageId, pages } = store.getState().design;
        const activePage = pages[activePageId];
        const [frameId] = activePage.rootOrder;
        const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

        return (activePage.nodes[frame.childIds[0]] as unknown as { gridColumnSpan?: number }).gridColumnSpan;
      }),
    ).toBe(2);
  });

  test('changing the grid size resets a spanning child back to a single cell', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-span-reset');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(
        addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
      );

      const state = store.getState().design;
      const activePage = state.pages[state.activePageId];
      const rectId = activePage.rootOrder[activePage.rootOrder.length - 1];

      store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
    });

    await page.mouse.click(FRAME.x1 + 10, FRAME.y1 + 10);

    const columnSpanField = page.getByLabel('Column span', { exact: true });

    await columnSpanField.fill('2');
    await columnSpanField.press('Enter');

    const readSpan = (): Promise<number | undefined> =>
      page.evaluate(async () => {
        const { store } = await import('/src/store/index.ts');
        const { activePageId, pages } = store.getState().design;
        const activePage = pages[activePageId];
        const [frameId] = activePage.rootOrder;
        const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

        return (activePage.nodes[frame.childIds[0]] as unknown as { gridColumnSpan?: number }).gridColumnSpan;
      });

    await expect.poll(readSpan).toBe(2);

    // grow the grid through the panel — the spanning child is reset to 1x1, not re-fitted
    await selectFrameRow(page);
    await page.locator('[data-test-grid-area]').click();

    const columnsField = page.getByLabel('Columns', { exact: true });

    await columnsField.fill('3');
    await columnsField.blur();

    await expect.poll(() => readColumnCount(page)).toBe(3);
    await expect.poll(readSpan).toBeUndefined();
  });

  test('dragging a new element into a multi-cell child drops it in the next free cell, not inside the span', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-span-drop');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // 3-column grid, one child pinned to the 2x2 block at (0,0)
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(updateNode({ changes: { gridAutoPlacement: false, gridColumnCount: 3 }, id: frameId }));
      store.dispatch(
        addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
      );

      const state = store.getState().design;
      const activePage = state.pages[state.activePageId];
      const rectId = activePage.rootOrder[activePage.rootOrder.length - 1];

      store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
      store.dispatch(
        updateNode({
          changes: { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0, gridRowSpan: 2 },
          id: rectId,
        }),
      );
    });

    // a second rectangle out on the canvas, dragged deep into the span's interior (cell 0,0 area)
    await designPage.drawRectangle(1400, 600, 1470, 660);

    await page.mouse.move(1435, 630);
    await page.mouse.down();
    await page.mouse.move(FRAME.x1 + 60, FRAME.y1 + 60, { steps: 12 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(150);

    const dropped = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };
      const last = activePage.nodes[frame.childIds[frame.childIds.length - 1]] as unknown as {
        gridColumnAnchorIndex?: number;
        gridRowAnchorIndex?: number;
      };

      return { childCount: frame.childIds.length, column: last.gridColumnAnchorIndex, row: last.gridRowAnchorIndex };
    });

    expect(dropped.childCount).toBe(2);
    // it skipped the 2x2 block and landed on the free cell in column 2, not somewhere inside it
    expect(dropped.column).toBe(2);
    expect(dropped.row).toBe(0);
  });

  test('the Column span cap follows the child’s position — only the free cells ahead of it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-span-cap');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // 4-column grid: child "a" pinned across columns 0-1, child "b" at column 2 — only 2 cells left
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(updateNode({ changes: { gridAutoPlacement: false, gridColumnCount: 4 }, id: frameId }));

      const addRect = (): string => {
        store.dispatch(
          addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
        );

        const state = store.getState().design;
        const activePage = state.pages[state.activePageId];

        return activePage.rootOrder[activePage.rootOrder.length - 1];
      };

      const aId = addRect();
      const bId = addRect();

      store.dispatch(moveNodes({ nodeIds: [aId, bId], targetIndex: 0, targetParentId: frameId }));
      store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0 }, id: aId }));
      store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0 }, id: bId }));
    });

    // select "b" (sits at column 2 of the 500px-wide 4-column grid -> ~x + 250)
    await page.mouse.click(FRAME.x1 + 258, FRAME.y1 + 10);

    const columnSpanField = page.getByLabel('Column span', { exact: true });

    await expect(columnSpanField).toBeVisible();

    const readSpan = (): Promise<number | undefined> =>
      page.evaluate(async () => {
        const { store } = await import('/src/store/index.ts');
        const { activePageId, pages } = store.getState().design;
        const activePage = pages[activePageId];
        const [frameId] = activePage.rootOrder;
        const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };
        const b = frame.childIds
          .map((id) => activePage.nodes[id] as unknown as { gridColumnAnchorIndex?: number; gridColumnSpan?: number })
          .find((node) => node.gridColumnAnchorIndex === 2);

        return b?.gridColumnSpan;
      });

    // 3 would run off the end of what "b" can reach (columns 2-3) -> refused, field snaps back
    await columnSpanField.fill('3');
    await columnSpanField.press('Enter');
    await expect(page.getByLabel('Column span', { exact: true })).toHaveValue('1');
    expect(await readSpan()).not.toBe(3);

    // 2 exactly fills the free run -> accepted
    await columnSpanField.fill('2');
    await columnSpanField.press('Enter');
    await expect.poll(readSpan).toBe(2);
  });

  test('dragging a multi-cell child previews its whole footprint of slots, not a single cell', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-span-footprint');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // a 3-column manual grid with a 2x2 child at (0,0) and a plain 1x1 child at (2,2)
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(updateNode({ changes: { gridAutoPlacement: false, gridColumnCount: 3, gridRowCount: 3 }, id: frameId }));

      const addRect = (): string => {
        store.dispatch(
          addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
        );

        const state = store.getState().design;
        const activePage = state.pages[state.activePageId];

        return activePage.rootOrder[activePage.rootOrder.length - 1];
      };

      const bigId = addRect();
      const smallId = addRect();

      store.dispatch(moveNodes({ nodeIds: [bigId, smallId], targetIndex: 0, targetParentId: frameId }));
      store.dispatch(
        updateNode({ changes: { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0, gridRowSpan: 2 }, id: bigId }),
      );
      store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 2 }, id: smallId }));
    });

    const safeArea = await designPage.canvasSafeArea();
    const hoverPoint = { x: FRAME.x1 + 170, y: FRAME.y1 + 60 };

    // drag the small 1x1 child near the middle of the grid — 1 slot lights up
    await designPage.click(FRAME.x1 + 420, FRAME.y1 + 480);
    await page.mouse.move(FRAME.x1 + 420, FRAME.y1 + 480);
    await page.mouse.down();
    await page.mouse.move(hoverPoint.x, hoverPoint.y, { steps: 8 });
    await page.waitForTimeout(150);
    const smallHover = await page.screenshot({ clip: safeArea });
    await page.mouse.up();
    await page.waitForTimeout(100);

    // drag the 2x2 child to the same spot — a 2x2 block of slots lights up instead
    await designPage.click(FRAME.x1 + 40, FRAME.y1 + 40);
    await page.mouse.move(FRAME.x1 + 40, FRAME.y1 + 40);
    await page.mouse.down();
    await page.mouse.move(hoverPoint.x, hoverPoint.y, { steps: 8 });
    await page.waitForTimeout(150);
    const bigHover = await page.screenshot({ clip: safeArea });
    await page.mouse.up();
    await page.waitForTimeout(100);

    expect(bigHover.equals(smallHover)).toBe(false);

    // multi-select both children and drag together — the footprint preview still renders
    await designPage.click(FRAME.x1 + 40, FRAME.y1 + 40);
    await page.keyboard.down('Shift');
    await designPage.click(FRAME.x1 + 420, FRAME.y1 + 480);
    await page.keyboard.up('Shift');
    await page.mouse.move(FRAME.x1 + 40, FRAME.y1 + 40);
    await page.mouse.down();
    await page.mouse.move(hoverPoint.x, hoverPoint.y, { steps: 8 });
    await page.waitForTimeout(150);
    const multiHover = await page.screenshot({ clip: safeArea });
    await page.mouse.up();

    expect(multiHover.equals(smallHover)).toBe(false);
  });

  test('dragging a wide child together with a small one does not drop the small one inside the wide one', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-multi-span-drop');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    // 4-column, 2-row grid: "big" spans columns 0-2 of row 0, "small" sits at column 3 of row 0.
    // "big" comes first in childIds so a select-small-then-big order mismatches the drop order.
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(updateNode({ changes: { gridAutoPlacement: false, gridColumnCount: 4, gridRowCount: 2 }, id: frameId }));

      const addRect = (): string => {
        store.dispatch(
          addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
        );

        const state = store.getState().design;
        const activePage = state.pages[state.activePageId];

        return activePage.rootOrder[activePage.rootOrder.length - 1];
      };

      const bigId = addRect();
      const smallId = addRect();

      store.dispatch(moveNodes({ nodeIds: [bigId, smallId], targetIndex: 0, targetParentId: frameId }));
      store.dispatch(
        updateNode({
          changes: {
            gridColumnAnchorIndex: 0,
            gridColumnSpan: 3,
            gridRowAnchorIndex: 0,
            heightSizingMode: 'fill',
            widthSizingMode: 'fill',
          },
          id: bigId,
        }),
      );
      store.dispatch(
        updateNode({
          changes: { gridColumnAnchorIndex: 3, gridRowAnchorIndex: 0, heightSizingMode: 'fill', widthSizingMode: 'fill' },
          id: smallId,
        }),
      );
    });

    const columnWidth = (FRAME.x2 - FRAME.x1) / 4;

    // select "small" first (column 3), then "big" (columns 0-2)
    await designPage.click(FRAME.x1 + columnWidth * 3 + columnWidth / 2, FRAME.y1 + 60);
    await designPage.click(FRAME.x1 + columnWidth, FRAME.y1 + 60, { shift: true });

    // drag the pair, grabbed from "big", down onto the empty second row
    await dragInto(page, { x: FRAME.x1 + columnWidth, y: FRAME.y1 + 60 }, { x: FRAME.x1 + 40, y: FRAME.y1 + 340 });
    await page.waitForTimeout(150);

    const placed = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

      return frame.childIds.map((id) => {
        const node = activePage.nodes[id] as unknown as {
          gridColumnAnchorIndex?: number;
          gridColumnSpan?: number;
          gridRowAnchorIndex?: number;
        };

        return {
          column: node.gridColumnAnchorIndex ?? 0,
          columnSpan: node.gridColumnSpan ?? 1,
          row: node.gridRowAnchorIndex ?? 0,
        };
      });
    });

    const big = placed.find((node) => node.columnSpan === 3);
    const small = placed.find((node) => node.columnSpan === 1);

    // the small child must not sit anywhere inside the wide child's 3-cell span
    const overlaps =
      big !== undefined &&
      small !== undefined &&
      small.row === big.row &&
      small.column >= big.column &&
      small.column < big.column + big.columnSpan;

    expect(overlaps).toBe(false);
  });

  test('the Open grid settings button swaps in a dedicated panel whose track rows resize, add and delete columns', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-settings-panel');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    for (const targetY of [250, 320, 390, 460]) {
      await designPage.drawRectangle(1400, targetY, 1450, targetY + 40);
      await dragInto(page, { x: 1425, y: targetY + 20 }, { x: 800, y: 400 });
    }

    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    // the dedicated panel replaces the normal frame properties
    await expect(flowGroup(page)).toBeHidden();
    // forcing rows explicit means the panel shows a concrete row count
    await expect.poll(() => readRowCount(page)).toBe(2);

    const columns = page.locator('[data-test-section="grid-columns"]');
    const beforeResize = await getChildren(page);

    // switch the first column track to a fixed width — the option's label is "Fixed width (…)",
    // never the exact word "Fixed" on its own
    await columns.locator('[data-test-grid-track-row="0"]').getByRole('button', { exact: true, name: 'Fill' }).click();
    await page.getByText(/Fixed width/).click();

    const firstValue = columns.getByLabel('Track size value').first();

    await firstValue.fill('240');
    await firstValue.blur();

    await expect.poll(() => getChildren(page)).not.toEqual(beforeResize);

    // add a column
    await columns.getByRole('button', { name: 'Add column' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(3);

    // select the last column track and delete it
    await columns.locator('[data-test-grid-track-row="2"]').click();
    await columns.getByRole('button', { name: 'Delete selected tracks' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(2);

    // closing returns to the normal properties
    await page.getByRole('button', { name: 'Close grid settings' }).click();
    await expect(page.locator('[data-test-grid-settings-panel]')).toBeHidden();
    await expect(flowGroup(page)).toBeVisible();
  });

  test('dragging a track by its handle reorders the grid columns and carries an anchored child, but a span-breaking move snaps back', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-track-reorder');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { addNode, moveNodes, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(updateNode({ changes: { gridAutoPlacement: false, gridColumnCount: 3, gridRowCount: 1 }, id: frameId }));

      const addRect = (): string => {
        store.dispatch(
          addNode({ fill: '#000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: 'rectangle', width: 20, x: 0, y: 0 }),
        );
        const state = store.getState().design;

        return state.pages[state.activePageId].rootOrder.at(-1) as string;
      };

      const anchored = addRect();
      const wide = addRect();

      store.dispatch(moveNodes({ nodeIds: [anchored, wide], targetIndex: 0, targetParentId: frameId }));
      store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0 }, id: anchored }));
      store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0 }, id: wide }));
    });

    await selectFrameRow(page);
    await openGridSettings(page);

    const readAnchors = (): Promise<Record<string, number | undefined>> =>
      page.evaluate(async () => {
        const { store } = await import('/src/store/index.ts');
        const { activePageId, pages } = store.getState().design;
        const activePage = pages[activePageId];
        const [frameId] = activePage.rootOrder;
        const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };
        const out: Record<string, number | undefined> = {};

        frame.childIds.forEach((id) => {
          out[(activePage.nodes[id] as unknown as { name: string }).name + id] = (
            activePage.nodes[id] as unknown as { gridColumnAnchorIndex?: number }
          ).gridColumnAnchorIndex;
        });

        return out;
      });

    const columns = page.locator('[data-test-section="grid-columns"]');

    const dragHandle = async (fromIndex: number, toRow: number): Promise<void> => {
      const handle = columns.locator(`[data-test-grid-track-row="${fromIndex}"]`).getByRole('button', { name: 'Reorder track' });
      const target = columns.locator(`[data-test-grid-track-row="${toRow}"]`);
      const from = await handle.boundingBox();
      const to = await target.boundingBox();

      await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
      await page.mouse.down();
      await page.mouse.move(to!.x + to!.width / 2, to!.y + 2, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(150);
    };

    // drag the 3rd column track to the front — the child anchored at column 2 rides to column 0
    await dragHandle(2, 0);
    await expect.poll(async () => Object.values(await readAnchors()).filter((value) => value === 0).length).toBeGreaterThanOrEqual(1);

    const afterFirst = await readAnchors();

    // grabbing an unselected track that belongs to a span auto-extends the drag to the whole
    // span, so an explicit single-track selection is needed to actually attempt splitting it:
    // the wide child now spans the last two columns; pulling only the middle one to the front
    // would split its span in two, so the reorder is rejected and every anchor stays put
    await columns.locator('[data-test-grid-track-row="1"]').click();
    await dragHandle(1, 0);
    expect(await readAnchors()).toEqual(afterFirst);
  });

  test('undo/redo works from inside the track value field, and carries the panel’s track selection with it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-undo');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');

    // select the second column track (not the default column 1)
    await columns.locator('[data-test-grid-track-row="1"]').click();
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);

    // add a third column — this is the panel's own change, the selection on column 2 must survive it
    await columns.getByRole('button', { name: 'Add column' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(3);
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);

    // undo from inside the value field itself — bypassGlobalShortcuts is off for this field, so
    // the shortcut must still reach the app instead of being swallowed by the input
    const firstValue = columns.getByLabel('Track size value').first();

    await firstValue.click();
    await page.keyboard.press('Control+z');

    await expect.poll(() => readColumnCount(page)).toBe(2);
    // undo/redo carries the panel's selection: column 2 was selected before the add, so it comes
    // back selected — not reset to the axis default, not left stale on a now-gone index
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="0"]')).not.toHaveClass(/--selected/);
  });

  test('undoing a two-track reorder brings both tracks back selected, not just one', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-undo-reorder-selection');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');

    // 3 columns so a 2-track block has somewhere to move
    await columns.getByRole('button', { name: 'Add column' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(3);

    // select columns 1 and 2
    await columns.locator('[data-test-grid-track-row="0"]').click();
    await columns.locator('[data-test-grid-track-row="1"]').click({ modifiers: ['ControlOrMeta'] });
    await expect(columns.locator('[data-test-grid-track-row="0"]')).toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);

    // drag the pair past the last row to reorder them to the end
    const handle = columns.locator('[data-test-grid-track-row="0"]').getByRole('button', { name: 'Reorder track' });
    const target = columns.locator('[data-test-grid-track-row="2"]');
    const from = await handle.boundingBox();
    const to = await target.boundingBox();

    await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
    await page.mouse.down();
    await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height, { steps: 8 });
    await page.mouse.up();

    // the moved pair stays selected at its new position
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="2"]')).toHaveClass(/--selected/);

    // undo — both original tracks come back selected, at their restored positions (not just one)
    await page.keyboard.press('Control+z');
    await expect(columns.locator('[data-test-grid-track-row="0"]')).toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="2"]')).not.toHaveClass(/--selected/);
  });

  test('deselecting and reselecting a grid frame does not reopen the dedicated panel on its own', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-close-on-reselect');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    // deselect by clicking empty canvas, then reselect the same grid frame
    await page.mouse.click(1500, 200);
    await selectFrameRow(page);

    // the normal frame properties show instead of the panel reopening on its own
    await expect(page.locator('[data-test-grid-settings-panel]')).toBeHidden();
    await expect(flowGroup(page)).toBeVisible();
  });

  test('shift/ctrl-clicking a track handle multi-selects instead of starting a drag', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-handle-multiselect');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');

    // switching to Grid already seeds 2 columns; add one more to have 3 rows to select across
    await columns.getByRole('button', { name: 'Add column' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(3);

    await columns.locator('[data-test-grid-track-row="0"]').click();

    const lastHandle = columns.locator('[data-test-grid-track-row="2"]').getByRole('button', { name: 'Reorder track' });

    await lastHandle.click({ modifiers: ['Shift'] });

    // a shift-click on the handle extends the range selection instead of the handle's own drag
    // swallowing the modifier and leaving only the row it was grabbed on selected
    await expect(columns.locator('[data-test-grid-track-row="0"]')).toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="2"]')).toHaveClass(/--selected/);
  });

  test('deleting the last remaining column exits grid mode back to free-form layout', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-delete-last-column');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');

    // switching to Grid already seeds 2 columns; delete down to 1, then delete that last one too
    await columns.locator('[data-test-grid-track-row="0"]').click();
    await columns.getByRole('button', { name: 'Delete selected tracks' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(1);

    await columns.locator('[data-test-grid-track-row="0"]').click();
    await columns.getByRole('button', { name: 'Delete selected tracks' }).click();

    // the panel closes on its own and the frame falls back to the normal free-form properties
    await expect(page.locator('[data-test-grid-settings-panel]')).toBeHidden();
    await expect(flowGroup(page)).toBeVisible();
    await expect(flowGroup(page).getByLabel('Free form', { exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking a multi-selected track handle without moving collapses the selection to just that row', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-click-collapses-selection');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');

    // switching to Grid already seeds 2 columns; both selected via ctrl-click
    await columns.locator('[data-test-grid-track-row="0"]').click();
    await columns.locator('[data-test-grid-track-row="1"]').click({ modifiers: ['ControlOrMeta'] });
    await expect(columns.locator('[data-test-grid-track-row="0"]')).toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);

    // grab row 1's handle (already part of the multi-selection) and release without moving
    const handle = columns.locator('[data-test-grid-track-row="1"]').getByRole('button', { name: 'Reorder track' });
    const box = await handle.boundingBox();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.up();

    // a plain click+release on a member of the group selects only that row
    await expect(columns.locator('[data-test-grid-track-row="0"]')).not.toHaveClass(/--selected/);
    await expect(columns.locator('[data-test-grid-track-row="1"]')).toHaveClass(/--selected/);
  });

  test('the drop indicator stays hidden and the grabbed row stays fully opaque until the pointer actually moves', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-drag-visuals');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');
    const dropIndicator = page.locator('[class*="GridTrackDropIndicator"]');
    const firstRow = columns.locator('[data-test-grid-track-row="0"]');
    const handle = firstRow.getByRole('button', { name: 'Reorder track' });
    const box = await handle.boundingBox();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();

    // grabbing the handle alone must not show the indicator or dim the row
    await expect(dropIndicator).toBeHidden();
    await expect(firstRow).toHaveCSS('opacity', '1');

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2 + 40, { steps: 5 });

    // once the pointer actually moves, the indicator shows and the row is still not dimmed
    await expect(dropIndicator).toBeVisible();
    await expect(firstRow).toHaveCSS('opacity', '1');

    await page.mouse.up();
  });

  test('the add and remove track buttons carry descriptive tooltips', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-track-tooltips');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');
    const rows = page.locator('[data-test-section="grid-rows"]');

    // the rows list's plus button announces its own axis, not the generic column copy
    await rows.getByRole('button', { name: 'Add row' }).hover();
    await expect(page.getByRole('tooltip')).toHaveText('Add row');

    await page.mouse.move(FRAME.x1 - 120, FRAME.y1);
    await expect(page.getByRole('tooltip')).toBeHidden();

    // a column row's minus button names the exact track it removes and the current track count
    const firstColumnMinus = columns.locator('[data-test-grid-track-row="0"]').getByRole('button', { name: 'Delete selected tracks' });

    await firstColumnMinus.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Remove column 1 of 2');

    await page.mouse.move(FRAME.x1 - 120, FRAME.y1);
    await expect(page.getByRole('tooltip')).toBeHidden();

    // select both columns — the same minus button now removes the whole selection, so it says so
    await columns.locator('[data-test-grid-track-row="0"]').click();
    await columns.locator('[data-test-grid-track-row="1"]').click({ modifiers: ['ControlOrMeta'] });
    await firstColumnMinus.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Remove 2 columns');
  });

  test('selecting tracks in the Grid panel highlights their cells on the canvas', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-section-highlight');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');

    await columns.getByRole('button', { name: 'Add column' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(3);

    const safeArea = await designPage.canvasSafeArea();

    // column 0 is pre-selected on open — its cells are highlighted
    await columns.locator('[data-test-grid-track-row="0"]').click();
    await page.waitForTimeout(150);
    const oneColumn = await page.screenshot({ clip: safeArea });

    // extend the panel selection to a second column — more cells light up on the canvas
    await columns.locator('[data-test-grid-track-row="2"]').click({ modifiers: ['ControlOrMeta'] });
    await page.waitForTimeout(150);
    const twoColumns = await page.screenshot({ clip: safeArea });

    expect(twoColumns.equals(oneColumn)).toBe(false);

    // toggling both columns back off clears the highlight entirely
    await columns.locator('[data-test-grid-track-row="0"]').click({ modifiers: ['ControlOrMeta'] });
    await columns.locator('[data-test-grid-track-row="2"]').click({ modifiers: ['ControlOrMeta'] });
    await page.waitForTimeout(150);
    const noneSelected = await page.screenshot({ clip: safeArea });

    expect(noneSelected.equals(oneColumn)).toBe(false);
    expect(noneSelected.equals(twoColumns)).toBe(false);
  });

  test('switching a column to Hug reflows the grid slot overlay on canvas', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-track-slot-reflow');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    // one small element inside the grid so Hug has something to hug down to
    await designPage.drawRectangle(1400, 300, 1440, 340);
    await dragInto(page, { x: 1420, y: 320 }, { x: 800, y: 400 });

    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);
    const row0 = page.locator('[data-test-section="grid-columns"]').locator('[data-test-grid-track-row="0"]');
    const safeArea = await designPage.canvasSafeArea();
    const uniform = await page.screenshot({ clip: safeArea });

    // switch column 0 to Hug via the mode dropdown — its slot should shrink to the child's width
    await row0.getByText('Fill', { exact: true }).click();
    await page.getByText('Hug contents').click();
    await page.waitForTimeout(150);

    const hugged = await page.screenshot({ clip: safeArea });
    expect(hugged.equals(uniform)).toBe(false);
  });

  test('the Fill value field re-weights the track as fr and drops to Fixed when the unit is removed', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-fill-value-field');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();

    await designPage.drawRectangle(1400, 300, 1440, 340);
    await dragInto(page, { x: 1420, y: 320 }, { x: 800, y: 400 });

    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');

    await columns.getByRole('button', { name: 'Add column' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(3);

    const row0 = columns.locator('[data-test-grid-track-row="0"]');
    const value0 = row0.getByLabel('Track size value');
    const safeArea = await designPage.canvasSafeArea();

    // three 1fr columns split the width evenly
    await page.waitForTimeout(150);
    const equalThirds = await page.screenshot({ clip: safeArea });

    // focusing the field selects just the digit (not the fr unit), so typing "3" over it
    // yields "3fr" — the track stays on Fill, now weighted 3:1:1
    await value0.click();
    await value0.pressSequentially('3');
    await value0.press('Enter');
    await expect.poll(() => readColumnTrack(page, 0)).toMatchObject({ mode: 'fill', value: 3 });
    await page.waitForTimeout(150);
    const weighted = await page.screenshot({ clip: safeArea });
    expect(weighted.equals(equalThirds)).toBe(false);

    // clearing the whole field down to a bare number (fr unit gone) drops the track to Fixed.
    // Set via the DOM directly (not Delete/Backspace) — those are bound to the global "delete
    // selected node" shortcut, which this field intentionally lets through.
    await value0.evaluate((el) => {
      const input = el as HTMLInputElement;
      const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

      input.focus();
      setValue?.call(input, '120');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await value0.press('Enter');
    await expect.poll(() => readColumnTrack(page, 0)).toMatchObject({ mode: 'fixed', value: 120 });
    await page.waitForTimeout(150);
    const fixed = await page.screenshot({ clip: safeArea });
    expect(fixed.equals(weighted)).toBe(false);
  });

  test('hovering a selected grid frame shows a track-insert affordance pill', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-track-affordance');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const safeArea = await designPage.canvasSafeArea();

    await page.mouse.move(FRAME.x1 - 40, (FRAME.y1 + FRAME.y2) / 2);
    await page.waitForTimeout(150);
    const hovered = await page.screenshot({ clip: safeArea });

    await page.mouse.move(FRAME.x2 + 100, FRAME.y1);
    await page.waitForTimeout(150);
    const idle = await page.screenshot({ clip: safeArea });

    expect(hovered.equals(idle)).toBe(false);
  });

  test('hovering directly on the affordance pill expands it into a grip/value/chevron control', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-track-affordance-expand');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const safeArea = await designPage.canvasSafeArea();

    await page.mouse.move(FRAME.x1 - 40, (FRAME.y1 + FRAME.y2) / 2);
    await page.waitForTimeout(150);
    const onPill = await page.screenshot({ clip: safeArea });

    await page.mouse.move(FRAME.x1 + 150, FRAME.y1 + 150);
    await page.waitForTimeout(150);
    const insideFrame = await page.screenshot({ clip: safeArea });

    expect(onPill.equals(insideFrame)).toBe(false);
  });

  test('hovering the expanded control switches the cursor per sub-element, and pressing the grip shows the pressing cursor', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-track-affordance-cursors');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const pillCenterX = FRAME.x1 - 40;
    const pillCenterY = (FRAME.y1 + FRAME.y2) / 2;

    // the value band sits centered on the pill — hovering it should show a text-input cursor
    await page.mouse.move(pillCenterX, pillCenterY);
    await page.waitForTimeout(150);
    await expect.poll(() => designPage.canvas.evaluate((el) => (el as HTMLElement).style.cursor)).toBe('text');

    // the grip band sits left of center — hovering it should show the hand cursor
    await page.mouse.move(pillCenterX - 15, pillCenterY);
    await page.waitForTimeout(150);
    await expect.poll(() => designPage.canvas.evaluate((el) => el.className)).toContain('--hand');

    // holding the mouse down on the grip should swap to the pressing cursor
    await page.mouse.down();
    await expect.poll(() => designPage.canvas.evaluate((el) => el.className)).toContain('--pressing');
    await page.mouse.up();
  });

  test('picking a mode from the dropdown applies the same mode and value to the whole multi-selection', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-multi-select-propagation');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await openGridSettings(page);

    const columns = page.locator('[data-test-section="grid-columns"]');

    await columns.getByRole('button', { name: 'Add column' }).click();
    await expect.poll(() => readColumnCount(page)).toBe(3);

    // select columns 0 and 2 — clicking into row 0's own dropdown below must not drop this
    const row0 = columns.locator('[data-test-grid-track-row="0"]');

    await row0.click();
    await columns.locator('[data-test-grid-track-row="2"]').click({ modifiers: ['ControlOrMeta'] });

    await row0.getByText('Fill', { exact: true }).click();
    await page.getByText(/Fixed width/).click();

    await expect.poll(() => readColumnTrack(page, 0)).toMatchObject({ mode: 'fixed' });
    const triggerTrack = await readColumnTrack(page, 0);

    expect(await readColumnTrack(page, 2)).toEqual(triggerTrack);
    // the untouched, unselected column keeps its own default fill mode
    expect(await readColumnTrack(page, 1)).toMatchObject({ mode: 'fill' });
  });

  test('clicking a track affordance pill on the canvas selects it in the panel and opens the Grid settings panel', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-click-select');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    // the row pill sits 40px left of the frame, vertically centered
    await page.mouse.click(FRAME.x1 - 40, (FRAME.y1 + FRAME.y2) / 2);

    await expect(page.locator('[data-test-grid-settings-panel]')).toBeVisible();
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'row', indices: [0] });

    const rowsSection = page.locator('[data-test-section="grid-rows"]');

    await expect(rowsSection.locator('[data-test-grid-track-row="0"]')).toHaveClass(/GridTrackRow--selected/);
  });

  test('Cmd/Ctrl-clicking a second column pill on the canvas adds it to the selection, matching the panel’s own multi-select', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-click-multi-select');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    // switching to Grid seeds a default of two equal-width columns — their pills sit 40px above the
    // frame, centered on each column
    const columnPillY = FRAME.y1 - 40;
    const column0X = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 4;
    const column1X = FRAME.x1 + (3 * (FRAME.x2 - FRAME.x1)) / 4;

    await page.mouse.click(column0X, columnPillY);
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0] });

    await page.keyboard.down('Control');
    await page.mouse.click(column1X, columnPillY);
    await page.keyboard.up('Control');
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0, 1] });

    // both columns must show selected in the panel too — not just the canvas-facing selection —
    // and stay that way, rather than flickering between a 1- and a 2-track selection
    const columnsSection = page.locator('[data-test-section="grid-columns"]');

    await expect(columnsSection.locator('[data-test-grid-track-row="0"]')).toHaveClass(/GridTrackRow--selected/);
    await expect(columnsSection.locator('[data-test-grid-track-row="1"]')).toHaveClass(/GridTrackRow--selected/);
    await page.waitForTimeout(300);
    await expect(columnsSection.locator('[data-test-grid-track-row="0"]')).toHaveClass(/GridTrackRow--selected/);
    await expect(columnsSection.locator('[data-test-grid-track-row="1"]')).toHaveClass(/GridTrackRow--selected/);
  });

  test('selecting a row in the panel pins its expanded control on the canvas even while the mouse is elsewhere', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-panel-click-pins-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const safeArea = await designPage.canvasSafeArea();

    // move away from the frame first, so neither screenshot is influenced by hover
    await page.mouse.move(200, 200);
    await page.waitForTimeout(150);
    const beforeSelection = await page.screenshot({ clip: safeArea });

    await openGridSettings(page);
    await page.locator('[data-test-section="grid-rows"] [data-test-grid-track-row="0"]').click();

    await page.mouse.move(200, 200);
    await page.waitForTimeout(150);
    const afterSelection = await page.screenshot({ clip: safeArea });

    expect(beforeSelection.equals(afterSelection)).toBe(false);
  });

  test('dragging a column pill’s grip on the canvas reorders the track and carries a multi-selection along without dropping it', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-drag-reorder');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    // add a third column via a direct store dispatch and pin the column gap to 0 — keeps the
    // RightPanel closed (so the canvas keeps its full width) and makes every pixel coordinate
    // below an exact equal three-way split of the frame, with no gap drift to account for
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId] = pages[activePageId].rootOrder;

      store.dispatch(updateNode({ changes: { gridColumnCount: 3, horizontalGap: 0 }, id: frameId }));
    });
    await expect.poll(() => readColumnCount(page)).toBe(3);

    const columnPillY = FRAME.y1 - 40;
    const columnWidth = (FRAME.x2 - FRAME.x1) / 3;
    const column0X = FRAME.x1 + columnWidth * 0.5;
    const column1X = FRAME.x1 + columnWidth * 1.5;
    const column2X = FRAME.x1 + columnWidth * 2.5;

    await page.mouse.click(column0X, columnPillY);
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0] });

    // Meta (not Control) for the multi-select modifier: on macOS, holding Control while clicking is
    // interpreted by the browser as a right-click, which opens the canvas context menu — the menu then
    // sits over the canvas and swallows the drag's own pointerdown below. The app's own click-index
    // resolver already treats Meta and Control as equivalent (`event.metaKey || event.ctrlKey`).
    await page.keyboard.down('Meta');
    await page.mouse.click(column1X, columnPillY);
    await page.keyboard.up('Meta');
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0, 1] });

    // grab column 1's grip (the band left of its expanded pill's center) and drag it past column 2
    await dragInto(page, { x: column1X - 15, y: columnPillY }, { x: column2X + 80, y: columnPillY });

    // the whole [0,1] block moves together and lands at the end — the drag never collapses the
    // multi-selection down to just the grabbed track
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [1, 2] });
  });

  test('holding a grip mid-drag shows a live drop-line indicator, distinct from the idle affordance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-drag-indicator');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const safeArea = await designPage.canvasSafeArea();
    const columnPillY = FRAME.y1 - 40;
    const column0X = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 4;
    const column1X = FRAME.x1 + (3 * (FRAME.x2 - FRAME.x1)) / 4;

    // hover only, no drag — baseline
    await page.mouse.move(column0X, columnPillY);
    await page.waitForTimeout(150);
    const idle = await page.screenshot({ clip: safeArea });

    // press the grip and drag toward the other column — the drop-line indicator should appear
    await page.mouse.move(column0X - 15, columnPillY);
    await page.mouse.down();
    await page.mouse.move(column1X, columnPillY, { steps: 10 });
    await page.waitForTimeout(150);
    const dragging = await page.screenshot({ clip: safeArea });

    await page.mouse.up();

    expect(dragging.equals(idle)).toBe(false);
  });

  test('deselecting the frame after picking a track pill closes the Grid settings panel and clears the canvas affordances', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-deselect-clears');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    // grab a row pill — selects the track and opens the Grid settings panel
    await page.mouse.click(FRAME.x1 - 40, (FRAME.y1 + FRAME.y2) / 2);

    await expect(page.locator('[data-test-grid-settings-panel]')).toBeVisible();
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'row', indices: [0] });

    // click empty canvas, well away from the frame — deselects everything
    await page.mouse.click(200, 200);

    await expect(page.locator('[data-test-grid-settings-panel]')).not.toBeVisible();
    await expect.poll(() => readGridTrackSelection(page)).toBeNull();
  });

  test('clicking the already-selected grid frame’s own body (not a pill) closes the Grid settings panel too', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-reclick-closes-panel');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    await page.mouse.click(FRAME.x1 - 40, (FRAME.y1 + FRAME.y2) / 2);

    await expect(page.locator('[data-test-grid-settings-panel]')).toBeVisible();
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'row', indices: [0] });

    // a plain click inside the same, still-selected frame — not on a pill — should close the
    // track-editing state and fall back to the ordinary Frame panel
    await page.mouse.click((FRAME.x1 + FRAME.x2) / 2, (FRAME.y1 + FRAME.y2) / 2);

    await expect(page.locator('[data-test-grid-settings-panel]')).not.toBeVisible();
    await expect.poll(() => readGridTrackSelection(page)).toBeNull();
  });

  test('clicking an already-selected track pill’s value on the canvas edits it in place, keeping it in fill mode for an "Nfr" input', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-value-edit-fr');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    // the seeded 2-column grid's first column pill, centered on the column, above the frame
    const columnPillY = FRAME.y1 - 40;
    const column0X = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 4;

    // first click selects the track; a second click on an already-selected value opens editing —
    // this (not a double-click) is what avoids collapsing a multi-selection, see the next test
    await page.mouse.click(column0X, columnPillY);
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0] });
    await page.mouse.click(column0X, columnPillY);
    await expect(canvasTrackValueInput(page)).toBeFocused();
    await canvasTrackValueInput(page).selectText();
    await page.keyboard.type('3fr');
    await page.keyboard.press('Enter');

    await expect.poll(() => readColumnTrack(page, 0)).toEqual({ mode: 'fill', value: 3 });
  });

  test('clicking an already-selected track pill’s value on the canvas drops it out of fill for a bare number, same as the panel field', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-value-edit-fixed');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const columnPillY = FRAME.y1 - 40;
    const column0X = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 4;

    // a bare number (no "fr" unit) drops the track out of fill, to fixed — same as the panel field
    await page.mouse.click(column0X, columnPillY);
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0] });
    await page.mouse.click(column0X, columnPillY);
    await expect(canvasTrackValueInput(page)).toBeFocused();
    await canvasTrackValueInput(page).selectText();
    await page.keyboard.type('150');
    await page.keyboard.press('Enter');

    await expect.poll(() => readColumnTrack(page, 0)).toEqual({ mode: 'fixed', value: 150 });
  });

  test('clicking a value pill that is part of a multi-selection applies the new value to every selected track, without dropping the rest of the selection', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-value-edit-multi-select');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const columnPillY = FRAME.y1 - 40;
    const column0X = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 4;
    const column1X = FRAME.x1 + (3 * (FRAME.x2 - FRAME.x1)) / 4;

    await page.mouse.click(column0X, columnPillY);
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0] });

    // Cmd (not Ctrl) — holding Control into a click triggers Chromium's macOS-style
    // contextmenu convention, which would swallow the next click on the canvas below
    await page.keyboard.down('Meta');
    await page.mouse.click(column1X, columnPillY);
    await page.keyboard.up('Meta');
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0, 1] });

    // clicking column 0's already-selected value must not collapse the pair down to just [0]
    await page.mouse.click(column0X, columnPillY);
    await expect(canvasTrackValueInput(page)).toBeFocused();
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0, 1] });

    await canvasTrackValueInput(page).selectText();
    await page.keyboard.type('200');
    await page.keyboard.press('Enter');

    const triggerTrack = await readColumnTrack(page, 0);

    expect(triggerTrack).toEqual({ mode: 'fixed', value: 200 });
    expect(await readColumnTrack(page, 1)).toEqual(triggerTrack);
  });

  test('pressing Escape while editing a canvas track value leaves it unchanged', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-value-edit-escape');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const columnPillY = FRAME.y1 - 40;
    const column0X = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 4;

    await page.mouse.click(column0X, columnPillY);
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0] });
    await page.mouse.click(column0X, columnPillY);
    await expect(canvasTrackValueInput(page)).toBeFocused();
    await canvasTrackValueInput(page).selectText();
    await page.keyboard.type('999');
    await page.keyboard.press('Escape');

    // no commit happened, so the track's stored size is still whatever it started as (unset —
    // the default fill weight only gets written to the node on an actual commit)
    await expect(canvasTrackValueInput(page)).toHaveCount(0);
    expect(await readColumnTrack(page, 0)).toBeUndefined();
  });

  test('clicking a track pill’s chevron on the canvas opens a mode menu with the same options as the panel', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-mode-menu-open');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const columnPillY = FRAME.y1 - 40;
    const column0X = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 4;

    // the chevron band sits right of the value, mirroring the grip band's offset on the left
    await page.mouse.click(column0X + 15, columnPillY);

    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0] });
    await expect(page.getByText('Fixed width', { exact: false })).toBeVisible();
    await expect(page.getByText('Hug contents')).toBeVisible();
    await expect(page.getByText('Fill container', { exact: false })).toBeVisible();
    // the Grid settings panel is not what opened here — the on-canvas menu covers the same control
    await expect(page.locator('[data-test-grid-settings-panel]')).not.toBeVisible();
  });

  test('picking a mode from the canvas chevron menu applies it to the whole multi-selection, matching the panel dropdown', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-grid-canvas-mode-menu-multi-select');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await expect(flowGroup(page)).toBeVisible();
    await selectFrameRow(page);
    await setFlow(page, 'Grid');
    await selectFrameRow(page);

    const columnPillY = FRAME.y1 - 40;
    const column0X = FRAME.x1 + (FRAME.x2 - FRAME.x1) / 4;
    const column1X = FRAME.x1 + (3 * (FRAME.x2 - FRAME.x1)) / 4;

    await page.mouse.click(column0X, columnPillY);
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0] });

    // Cmd (not Ctrl) — holding Control into a click triggers Chromium's macOS-style
    // contextmenu convention, which would swallow the next click on the canvas below
    await page.keyboard.down('Meta');
    await page.mouse.click(column1X, columnPillY);
    await page.keyboard.up('Meta');
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0, 1] });

    // opening the chevron menu on the already-selected column 0 must not drop column 1
    await page.mouse.click(column0X + 15, columnPillY);
    await expect.poll(() => readGridTrackSelection(page)).toMatchObject({ axis: 'column', indices: [0, 1] });

    await page.getByText('Hug contents').click();

    expect(await readColumnTrack(page, 0)).toMatchObject({ mode: 'hug' });
    expect(await readColumnTrack(page, 1)).toMatchObject({ mode: 'hug' });
    await expect(page.getByText('Hug contents')).not.toBeVisible();
  });
});
