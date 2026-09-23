import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// Selecting children that live under different parents: every parent is its own isolated group.
// Groups: (A) two root rects, (B) a free-form frame, (C) a vertical auto-layout frame, (D) a
// horizontal auto-layout frame, (E) a grid frame. Only the group under the cursor may reparent /
// reorder / ghost; the others are only translated by the same delta (free-form + absolute live,
// auto-layout + grid resolved on drop) and never change parent.

const B_FRAME = { x1: 520, x2: 820, y1: 100, y2: 300 };
const C_FRAME = { x1: 520, x2: 720, y1: 350, y2: 650 };
const D_FRAME = { x1: 760, x2: 1160, y1: 350, y2: 650 };
const E_FRAME = { x1: 1200, x2: 1560, y1: 350, y2: 650 };
const STAGING = { x1: 1610, x2: 1670, y1: 100, y2: 160 };

const DELTA = { x: 80, y: 80 };
const DELTA_TOLERANCE = 12;

type TSceneNode = {
  childIds?: string[];
  height: number;
  id: string;
  parentId: string | null;
  type: string;
  width: number;
  x: number;
  y: number;
};

type TScene = {
  A: TSceneNode[];
  B: { children: TSceneNode[]; frame: TSceneNode };
  C: { children: TSceneNode[]; frame: TSceneNode };
  D: { children: TSceneNode[]; frame: TSceneNode };
  E: { children: TSceneNode[]; frame: TSceneNode };
  nodeCount: number;
  parents: Record<string, string | null>;
};

const flowGroup = (page: Page): Locator => page.locator('[data-test-toggle-button-group="flow"]');

const setFlow = async (page: Page, option: 'Grid' | 'Horizontal' | 'Vertical'): Promise<void> => {
  await flowGroup(page).getByLabel(option, { exact: true }).click();
};

const dragBy = async (page: Page, from: { x: number; y: number }, delta: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + delta.x, from.y + delta.y, { steps: 12 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const readScene = (page: Page): Promise<TScene> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const pick = (id: string): TSceneNode => {
      const node = nodes[id] as unknown as TSceneNode;

      return {
        childIds: node.childIds,
        height: node.height,
        id: node.id,
        parentId: node.parentId,
        type: node.type,
        width: node.width,
        x: node.x,
        y: node.y,
      };
    };
    const group = (frameId: string): { children: TSceneNode[]; frame: TSceneNode } => {
      const frame = pick(frameId);

      return { children: (frame.childIds ?? []).map(pick), frame };
    };
    const rootNodes = rootOrder.map(pick);
    const [b, c, d, e] = rootNodes.filter((node) => node.type === 'frame');

    if (!e) {
      throw new Error(`expected four root frames, got ${JSON.stringify(rootNodes)}`);
    }

    return {
      A: rootNodes.filter((node) => node.type !== 'frame'),
      B: group(b.id),
      C: group(c.id),
      D: group(d.id),
      E: group(e.id),
      nodeCount: Object.keys(nodes).length,
      parents: Object.fromEntries(Object.values(nodes).map((node) => [node.id, node.parentId])),
    };
  });

const selectIds = (page: Page, ids: string[]): Promise<void> =>
  page.evaluate(async (selection) => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');

    store.dispatch(setSelection(selection));
  }, ids);

const center = (node: TSceneNode): { x: number; y: number } => ({ x: node.x + node.width / 2, y: node.y + node.height / 2 });

const buildFrame = async (
  designPage: DesignPage,
  page: Page,
  box: { x1: number; x2: number; y1: number; y2: number },
  flow: 'Grid' | 'Horizontal' | 'Vertical' | null,
  dropPoints: { x: number; y: number }[],
  childSize = STAGING.x2 - STAGING.x1,
): Promise<void> => {
  await designPage.drawFrame(box.x1, box.y1, box.x2, box.y2);

  if (flow) {
    await setFlow(page, flow);
  }

  for (const dropPoint of dropPoints) {
    await designPage.drawRectangle(STAGING.x1, STAGING.y1, STAGING.x1 + childSize, STAGING.y1 + childSize);
    await dragInto(page, { x: STAGING.x1 + childSize / 2, y: STAGING.y1 + childSize / 2 }, dropPoint);
  }
};

const buildScene = async (designPage: DesignPage, page: Page): Promise<TScene> => {
  await designPage.goto(`e2e-test-multi-parent-selection-${Math.random().toString(36).slice(2, 8)}`);
  await expect(designPage.canvas).toBeVisible();

  await buildFrame(designPage, page, B_FRAME, null, [
    { x: 560, y: 150 },
    { x: 700, y: 240 },
  ]);
  await buildFrame(designPage, page, C_FRAME, 'Vertical', [
    { x: 620, y: 620 },
    { x: 620, y: 620 },
    { x: 620, y: 620 },
  ]);
  await buildFrame(designPage, page, D_FRAME, 'Horizontal', [
    { x: 1130, y: 500 },
    { x: 1130, y: 500 },
    { x: 1130, y: 500 },
  ]);
  await buildFrame(designPage, page, E_FRAME, 'Grid', [
    { x: 1380, y: 500 },
    { x: 1380, y: 500 },
    { x: 1380, y: 500 },
  ]);

  await designPage.drawRectangle(900, 100, 960, 160);
  await designPage.drawRectangle(1000, 100, 1060, 160);

  const scene = await readScene(page);

  expect(scene.A).toHaveLength(2);
  expect(scene.B.children).toHaveLength(2);
  expect(scene.C.children).toHaveLength(3);
  expect(scene.D.children).toHaveLength(3);
  expect(scene.E.children).toHaveLength(3);

  return scene;
};

const ids = (nodes: TSceneNode[]): string[] => nodes.map((node) => node.id);

const expectMovedBy = (before: TSceneNode[], after: TSceneNode[], delta: { x: number; y: number }): void => {
  before.forEach((node, index) => {
    expect(Math.abs(after[index].x - node.x - delta.x)).toBeLessThanOrEqual(DELTA_TOLERANCE);
    expect(Math.abs(after[index].y - node.y - delta.y)).toBeLessThanOrEqual(DELTA_TOLERANCE);
  });
};

const expectNoClonesAndSameParents = (before: TScene, after: TScene): void => {
  expect(after.nodeCount).toBe(before.nodeCount);
  expect(after.parents).toEqual(before.parents);
};

const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

// DRAFT_FRAME_STROKE is #337ae1 — the 1px outline is anti-aliased, so match on "clearly bluer than red" over the neutral gray canvas
const isSelectionBlue = ([r, , b]: [number, number, number]): boolean => b - r >= 60;

const hasBlueNear = async (page: Page, x: number, y: number): Promise<boolean> => {
  for (let offset = -2; offset <= 2; offset += 1) {
    if (isSelectionBlue(await readPixelColor(page, Math.round(x) + offset, Math.round(y)))) {
      return true;
    }
  }

  return false;
};

test.describe('multi-parent selection — every parent is its own isolated group', () => {
  test.describe.configure({ timeout: 180_000 });

  test('draws an individual selection outline per parent group instead of one combined box', async ({ page }) => {
    const designPage = new DesignPage(page);
    const scene = await buildScene(designPage, page);
    const [a1, a2] = scene.A;

    // (A) two root rects + (C) one auto-layout child → two groups, the one on the left is A
    await selectIds(page, [a1.id, a2.id, scene.C.children[0].id]);
    await page.mouse.move(1700, 900);
    await page.waitForTimeout(200);

    // the left edge of A's own bounds carries an outline…
    expect(await hasBlueNear(page, a1.x, a1.y + a1.height / 2)).toBe(true);
    // …while the left edge of the would-be combined box (x of C's child, far below A) is not
    // outlined at A's height, and the gap between A's rects and C's child has no shared frame line
    const c0 = scene.C.children[0];

    expect(await hasBlueNear(page, c0.x, a1.y + a1.height / 2)).toBe(false);
  });

  test('dragging (A) moves A and the free-form (B) children by the same delta and reparents nothing', async ({ page }) => {
    const designPage = new DesignPage(page);
    const before = await buildScene(designPage, page);

    await selectIds(page, [...ids(before.A), ...ids(before.B.children)]);
    await dragBy(page, center(before.A[0]), DELTA);

    const after = await readScene(page);

    expectMovedBy(before.A, after.A, DELTA);
    expectMovedBy(before.B.children, after.B.children, DELTA);
    expectNoClonesAndSameParents(before, after);
  });

  test('dragging (B) moves the free-form children and the root rects (A) by the same delta', async ({ page }) => {
    const designPage = new DesignPage(page);
    const before = await buildScene(designPage, page);

    await selectIds(page, [...ids(before.A), ...ids(before.B.children)]);
    await dragBy(page, center(before.B.children[0]), DELTA);

    const after = await readScene(page);

    expectMovedBy(before.B.children, after.B.children, DELTA);
    expectMovedBy(before.A, after.A, DELTA);
    expectNoClonesAndSameParents(before, after);
  });

  test('dragging (C) reorders only C live, reorders (D) on drop and moves (A) and (B) by the same delta', async ({ page }) => {
    const designPage = new DesignPage(page);
    const before = await buildScene(designPage, page);

    await selectIds(page, [before.C.children[0].id, before.D.children[0].id, ...ids(before.A), ...ids(before.B.children)]);

    await page.mouse.move(center(before.C.children[0]).x, center(before.C.children[0]).y);
    await page.mouse.down();
    await page.mouse.move(center(before.C.children[0]).x + DELTA.x, center(before.C.children[0]).y + DELTA.y, { steps: 12 });
    await page.waitForTimeout(150);

    // mid-drag only the grabbed group is in flight: D's child has not moved or been reordered yet
    const midDrag = await readScene(page);

    expect(ids(midDrag.D.children)).toEqual(ids(before.D.children));
    expect(midDrag.D.children[0].x).toBe(before.D.children[0].x);
    // free-form + root groups already follow live
    expectMovedBy(before.A, midDrag.A, DELTA);
    expectMovedBy(before.B.children, midDrag.B.children, DELTA);

    await page.mouse.up();

    const after = await readScene(page);

    expect(ids(after.C.children)).toEqual([before.C.children[1].id, before.C.children[0].id, before.C.children[2].id]);
    expect(ids(after.D.children)).toEqual([before.D.children[1].id, before.D.children[0].id, before.D.children[2].id]);
    expectMovedBy(before.A, after.A, DELTA);
    expectMovedBy(before.B.children, after.B.children, DELTA);
    expectNoClonesAndSameParents(before, after);
  });

  test('dragging (D) reorders only D live, reorders (C) on drop and moves (A) and (B) by the same delta', async ({ page }) => {
    const designPage = new DesignPage(page);
    const before = await buildScene(designPage, page);

    await selectIds(page, [before.C.children[0].id, before.D.children[0].id, ...ids(before.A), ...ids(before.B.children)]);

    await page.mouse.move(center(before.D.children[0]).x, center(before.D.children[0]).y);
    await page.mouse.down();
    await page.mouse.move(center(before.D.children[0]).x + DELTA.x, center(before.D.children[0]).y + DELTA.y, { steps: 12 });
    await page.waitForTimeout(150);

    const midDrag = await readScene(page);

    expect(ids(midDrag.C.children)).toEqual(ids(before.C.children));
    expect(midDrag.C.children[0].y).toBe(before.C.children[0].y);

    await page.mouse.up();

    const after = await readScene(page);

    expect(ids(after.D.children)).toEqual([before.D.children[1].id, before.D.children[0].id, before.D.children[2].id]);
    expect(ids(after.C.children)).toEqual([before.C.children[1].id, before.C.children[0].id, before.C.children[2].id]);
    expectMovedBy(before.A, after.A, DELTA);
    expectMovedBy(before.B.children, after.B.children, DELTA);
    expectNoClonesAndSameParents(before, after);
  });

  test('dragging (E) changes only the grid group — its child returns to its auto slot — while (A) and (B) follow the delta', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);
    const before = await buildScene(designPage, page);

    await selectIds(page, [before.E.children[0].id, ...ids(before.A), ...ids(before.B.children)]);
    await dragBy(page, center(before.E.children[0]), DELTA);

    const after = await readScene(page);

    expect(ids(after.E.children)).toEqual(ids(before.E.children));
    expect(after.C.children.map((node) => node.y)).toEqual(before.C.children.map((node) => node.y));
    expect(after.D.children.map((node) => node.x)).toEqual(before.D.children.map((node) => node.x));
    expectMovedBy(before.A, after.A, DELTA);
    expectMovedBy(before.B.children, after.B.children, DELTA);
    expectNoClonesAndSameParents(before, after);
  });

  test('with every child of every frame selected, a drag never clones or reparents any node', async ({ page }) => {
    const designPage = new DesignPage(page);
    const before = await buildScene(designPage, page);

    await selectIds(page, [
      ...ids(before.A),
      ...ids(before.B.children),
      ...ids(before.C.children),
      ...ids(before.D.children),
      ...ids(before.E.children),
    ]);
    await dragBy(page, center(before.C.children[0]), DELTA);

    const after = await readScene(page);

    expectNoClonesAndSameParents(before, after);
    expect(ids(after.B.children)).toEqual(ids(before.B.children));
    expect(ids(after.E.children)).toEqual(ids(before.E.children));
    expectMovedBy(before.A, after.A, DELTA);
    expectMovedBy(before.B.children, after.B.children, DELTA);
  });

  test('a single Ctrl+Z reverts every group touched by the drag', async ({ page }) => {
    const designPage = new DesignPage(page);
    const before = await buildScene(designPage, page);

    await selectIds(page, [before.C.children[0].id, before.D.children[0].id, ...ids(before.A), ...ids(before.B.children)]);
    await dragBy(page, center(before.C.children[0]), DELTA);
    await page.keyboard.press('Control+z');

    const afterUndo = await readScene(page);

    expect(ids(afterUndo.C.children)).toEqual(ids(before.C.children));
    expect(ids(afterUndo.D.children)).toEqual(ids(before.D.children));
    expect(afterUndo.A.map((node) => [node.x, node.y])).toEqual(before.A.map((node) => [node.x, node.y]));
    expect(afterUndo.B.children.map((node) => [node.x, node.y])).toEqual(before.B.children.map((node) => [node.x, node.y]));
  });
});

const readFrames = (page: Page): Promise<{ children: TSceneNode[]; frame: TSceneNode }[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const pick = (id: string): TSceneNode => {
      const node = nodes[id] as unknown as TSceneNode & { gridColumnAnchorIndex?: number; gridRowAnchorIndex?: number };

      return {
        childIds: node.childIds,
        height: node.height,
        id: node.id,
        parentId: node.parentId,
        type: node.type,
        width: node.width,
        x: node.x,
        y: node.y,
        ...(node.gridColumnAnchorIndex === undefined ? {} : { gridColumnAnchorIndex: node.gridColumnAnchorIndex }),
        ...(node.gridRowAnchorIndex === undefined ? {} : { gridRowAnchorIndex: node.gridRowAnchorIndex }),
      } as TSceneNode;
    };

    return rootOrder
      .map(pick)
      .filter((node) => node.type === 'frame')
      .map((frame) => ({ children: (frame.childIds ?? []).map(pick), frame }));
  });

const configureManualGrid = (
  page: Page,
  frameId: string,
  grid: { columns: number; rows: number },
  anchors: { childId: string; column: number; row: number }[],
): Promise<void> =>
  page.evaluate(
    async ({ anchors: childAnchors, frameId: id, grid: size }) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(updateNode({ changes: { gridAutoPlacement: false, gridColumnCount: size.columns, gridRowCount: size.rows }, id }));
      childAnchors.forEach(({ childId, column, row }) => {
        store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: column, gridRowAnchorIndex: row }, id: childId }));
      });
    },
    { anchors, frameId, grid },
  );

const readAnchor = (page: Page, id: string): Promise<{ column: number | undefined; row: number | undefined }> =>
  page.evaluate(async (nodeId) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const node = pages[activePageId].nodes[nodeId] as unknown as { gridColumnAnchorIndex?: number; gridRowAnchorIndex?: number };

    return { column: node.gridColumnAnchorIndex, row: node.gridRowAnchorIndex };
  }, id);

test.describe('multi-parent selection — followers move by the same number of slots, not the same pixels', () => {
  test.describe.configure({ timeout: 180_000 });

  test('a 5x5 grid child follows a 1x2 grid child by exactly one cell, even though its cells are much smaller', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto(`e2e-test-multi-parent-grid-slots-${Math.random().toString(36).slice(2, 8)}`);
    await expect(designPage.canvas).toBeVisible();

    // small-cell grid: 500x300 split 5x5 (100x60 cells); big-cell grid: 460x300 split 1 column x 2 rows (460x150 cells)
    await buildFrame(designPage, page, { x1: 520, x2: 1020, y1: 350, y2: 650 }, 'Grid', [{ x: 700, y: 500 }], 40);
    await buildFrame(designPage, page, { x1: 1100, x2: 1560, y1: 350, y2: 650 }, 'Grid', [{ x: 1300, y: 420 }], 40);

    const [small, big] = await readFrames(page);

    await configureManualGrid(page, small.frame.id, { columns: 5, rows: 5 }, [{ childId: small.children[0].id, column: 2, row: 2 }]);
    await configureManualGrid(page, big.frame.id, { columns: 1, rows: 2 }, [{ childId: big.children[0].id, column: 0, row: 0 }]);

    const [smallBefore, bigBefore] = await readFrames(page);

    await selectIds(page, [smallBefore.children[0].id, bigBefore.children[0].id]);
    await dragBy(page, center(bigBefore.children[0]), { x: 0, y: 150 });

    const [smallAfter, bigAfter] = await readFrames(page);

    expect(await readAnchor(page, bigAfter.children[0].id)).toEqual({ column: 0, row: 1 });
    expect(await readAnchor(page, smallAfter.children[0].id)).toEqual({ column: 2, row: 3 });
    expect(smallAfter.frame.childIds).toEqual(smallBefore.frame.childIds);
    expect(bigAfter.frame.childIds).toEqual(bigBefore.frame.childIds);
  });

  test('a horizontal list child follows a vertical list child by the same number of slots, whatever the child sizes', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto(`e2e-test-multi-parent-linear-slots-${Math.random().toString(36).slice(2, 8)}`);
    await expect(designPage.canvas).toBeVisible();

    // vertical list of 60px children, horizontal list of tiny 20px children: one slot down = ~70px, which in pixels
    // would cross two 20px+gap siblings on the other list
    await buildFrame(
      designPage,
      page,
      C_FRAME,
      'Vertical',
      [
        { x: 620, y: 620 },
        { x: 620, y: 620 },
        { x: 620, y: 620 },
      ],
      60,
    );
    await buildFrame(
      designPage,
      page,
      D_FRAME,
      'Horizontal',
      [
        { x: 1130, y: 500 },
        { x: 1130, y: 500 },
        { x: 1130, y: 500 },
      ],
      20,
    );

    const [vertical, horizontal] = await readFrames(page);

    await selectIds(page, [vertical.children[0].id, horizontal.children[0].id]);
    await dragBy(page, center(vertical.children[0]), { x: 0, y: 80 });

    const [verticalAfter, horizontalAfter] = await readFrames(page);

    expect(ids(verticalAfter.children)).toEqual([vertical.children[1].id, vertical.children[0].id, vertical.children[2].id]);
    expect(ids(horizontalAfter.children)).toEqual([horizontal.children[1].id, horizontal.children[0].id, horizontal.children[2].id]);
  });
});
