import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test.describe.configure({ mode: 'serial' });

// v1(x,y) -> v2(x+100,y) -> v3(x+100,y+100) -> v4(x,y+100) -> back onto v1, closing the loop — same
// shape as multi-vector-edit.spec.ts's own drawClosedSquareAt, kept local so this file has no
// cross-file dependency.
const drawClosedSquareAt = async (designPage: DesignPage, x: number, y: number): Promise<void> => {
  await designPage.drawVectorPath([
    { x, y },
    { x: x + 100, y },
    { x: x + 100, y: y + 100 },
    { x, y: y + 100 },
    { x, y },
  ]);
};

const exitVectorEditMode = async (designPage: DesignPage): Promise<void> => {
  await designPage.selectTool('default');
};

// plain-click the first point (replacing the selection), shift-click every other point (adding to
// it), then Enter opens every currently-selected vector node for editing at once — same mechanism
// multi-vector-edit.spec.ts exercises directly.
const openMultipleViaEnter = async (designPage: DesignPage, page: Page, points: { x: number; y: number }[]): Promise<void> => {
  const [first, ...rest] = points;

  await designPage.click(first.x, first.y);

  for (const point of rest) {
    await designPage.click(point.x, point.y, { shift: true });
  }

  await page.keyboard.press('Enter');
};

type TDesignSnapshot = {
  nodes: Record<string, { filledFaceKeys?: string[]; vertices?: Record<string, { x: number; y: number }> }>;
  rootOrder: string[];
  vectorEditingNodeIds: string[];
};

const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { nodes, rootOrder, vectorEditingNodeIds } = store.getState().design;

    return { nodes, rootOrder, vectorEditingNodeIds };
  });

const paintWholeSquareAt = async (designPage: DesignPage, page: Page, x: number, y: number): Promise<void> => {
  await page.keyboard.press('Shift+B');
  await designPage.click(x + 50, y + 50);
};

test('a Divide drag that only crosses one of two open nodes touches just that one — the sibling open node is left completely untouched', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-multi-touches-only-crossed-node');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await paintWholeSquareAt(designPage, page, 900, 300);
  await exitVectorEditMode(designPage);

  await drawClosedSquareAt(designPage, 1300, 300); // B, far enough right that the cut line below misses it
  await paintWholeSquareAt(designPage, page, 1300, 300);
  await exitVectorEditMode(designPage);

  const before = await readDesignState(page);
  const [idA, idB] = before.rootOrder;

  await openMultipleViaEnter(designPage, page, [
    { x: 950, y: 350 },
    { x: 1350, y: 350 },
  ]);

  await page.keyboard.press('x');
  // a line clearly past both sides of A (850..1050), nowhere near B (1300..1400)
  await designPage.dragVectorPoint(850, 350, 1050, 350);

  const after = await readDesignState(page);
  const newIds = after.rootOrder.filter((id) => !before.rootOrder.includes(id));

  // A's own id is reused for one of its 2 resulting pieces, plus exactly 1 brand-new id for the other;
  // B still exists under its original id, byte-identical to before
  expect(newIds).toHaveLength(1);
  expect(after.rootOrder).toContain(idA);
  expect(Object.keys(after.nodes[idA].vertices!)).toHaveLength(4);
  expect(after.nodes[idB]).toEqual(before.nodes[idB]);
  expect(after.vectorEditingNodeIds).toContain(idB);
});

test('one Divide drag that crosses both open nodes produces 4 resulting pieces total, all left open for editing', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-multi-crosses-both-nodes');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A: x 900..1000
  await paintWholeSquareAt(designPage, page, 900, 300);
  await exitVectorEditMode(designPage);

  await drawClosedSquareAt(designPage, 1100, 300); // B: x 1100..1200, close enough for one line to span both
  await paintWholeSquareAt(designPage, page, 1100, 300);
  await exitVectorEditMode(designPage);

  const before = await readDesignState(page);

  await openMultipleViaEnter(designPage, page, [
    { x: 950, y: 350 },
    { x: 1150, y: 350 },
  ]);

  await page.keyboard.press('x');
  // one line, past both sides of BOTH squares (A: 900..1000, B: 1100..1200)
  await designPage.dragVectorPoint(850, 350, 1250, 350);

  const after = await readDesignState(page);
  const newIds = after.rootOrder.filter((id) => !before.rootOrder.includes(id));

  // both originals get replaced by 2 pieces each — 2 reused ids (one per shape) + 2 brand-new ones
  expect(newIds).toHaveLength(2);
  expect(after.rootOrder).toHaveLength(4);
  expect(after.vectorEditingNodeIds.slice().sort()).toEqual(after.rootOrder.slice().sort());

  after.vectorEditingNodeIds.forEach((id) => {
    expect(after.nodes[id].filledFaceKeys!.length).toBeGreaterThan(0);
    expect(Object.keys(after.nodes[id].vertices!)).toHaveLength(4);
  });
});

test('a single Undo after one drag cut both open nodes reverts both back to their original single-piece state at once', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-cut-multi-undo-both-nodes');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300);
  await paintWholeSquareAt(designPage, page, 900, 300);
  await exitVectorEditMode(designPage);

  await drawClosedSquareAt(designPage, 1100, 300);
  await paintWholeSquareAt(designPage, page, 1100, 300);
  await exitVectorEditMode(designPage);

  const before = await readDesignState(page);

  await openMultipleViaEnter(designPage, page, [
    { x: 950, y: 350 },
    { x: 1150, y: 350 },
  ]);

  await page.keyboard.press('x');
  await designPage.dragVectorPoint(850, 350, 1250, 350);

  const afterCut = await readDesignState(page);

  expect(afterCut.rootOrder).toHaveLength(4); // sanity check: the drag actually cut both

  await page.keyboard.press('Control+z');

  const afterUndo = await readDesignState(page);

  expect(afterUndo.rootOrder.slice().sort()).toEqual(before.rootOrder.slice().sort());
  before.rootOrder.forEach((id) => expect(afterUndo.nodes[id]).toEqual(before.nodes[id]));
});
