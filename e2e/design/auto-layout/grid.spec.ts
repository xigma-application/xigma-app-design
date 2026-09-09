import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// Phase 1 of grid auto-layout ships the position engine only — no dedicated grid UI yet. The cell
// math (track sizing, placement order, gaps, padding, hug, spanning, per-cell alignment) is pinned
// exhaustively by the unit suite under src/store/design/utils/autoLayout/computeGridLayoutPositions/.
// What only a real browser proves is the one wiring Phase 1 does touch: the RightPanel Flow toggle's
// "Grid" button dispatching layoutMode: grid + the seeded column count, syncAutoLayoutChildren
// running its grid branch, and the canvas repainting — the same round-trip rationale as flow.spec.ts.

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
});
