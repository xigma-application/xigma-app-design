import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

test.describe.configure({ mode: 'serial' });

// v1(x,y) -> v2(x+100,y) -> v3(x+100,y+100) -> v4(x,y+100) -> back onto v1, closing the loop — same
// shape as vector-cut-multi.spec.ts's own drawClosedSquareAt, kept local so this file has no
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
// vector-cut-multi.spec.ts exercises directly.
const openMultipleViaEnter = async (designPage: DesignPage, page: Page, points: { x: number; y: number }[]): Promise<void> => {
  const [first, ...rest] = points;

  await designPage.click(first.x, first.y);

  for (const point of rest) {
    await designPage.click(point.x, point.y, { shift: true });
  }

  await page.keyboard.press('Enter');
};

const paintWholeSquareAt = async (designPage: DesignPage, page: Page, x: number, y: number): Promise<void> => {
  await page.keyboard.press('Shift+B');
  await designPage.click(x + 50, y + 50);
};

type TDesignSnapshot = {
  nodes: Record<string, { filledFaceKeys?: string[]; segments: Record<string, unknown> }>;
  rootOrder: string[];
  vectorEditingNodeIds: string[];
};

const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { nodes, rootOrder, vectorEditingNodeIds } = store.getState().design;

    return { nodes, rootOrder, vectorEditingNodeIds };
  });

test('a brush drag that only crosses one of two open filled nodes touches just that one — the sibling stays byte-identical', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-erase-multi-touches-only-crossed-node');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A
  await paintWholeSquareAt(designPage, page, 900, 300);
  await exitVectorEditMode(designPage);

  await drawClosedSquareAt(designPage, 1300, 300); // B, far enough right that the brush below never reaches it
  await paintWholeSquareAt(designPage, page, 1300, 300);
  await exitVectorEditMode(designPage);

  const before = await readDesignState(page);
  const [idA, idB] = before.rootOrder;

  await openMultipleViaEnter(designPage, page, [
    { x: 950, y: 350 },
    { x: 1350, y: 350 },
  ]);

  await page.keyboard.press('Shift+E');
  // a dip through A's top edge only (900..1000), nowhere near B (1300..1400)
  await designPage.dragEraseBrush([
    { x: 950, y: 285 },
    { x: 950, y: 340 },
    { x: 950, y: 285 },
  ]);

  const after = await readDesignState(page);

  // A was actually carved into (more segments, fill survives) …
  expect(Object.keys(after.nodes[idA].segments).length).toBeGreaterThan(Object.keys(before.nodes[idA].segments).length);
  expect(after.nodes[idA].filledFaceKeys!.length).toBeGreaterThan(0);
  // … while B is completely untouched
  expect(after.nodes[idB]).toEqual(before.nodes[idB]);
});

test('one brush drag that dips through both open filled nodes carves a channel in each without destroying either fill', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-erase-multi-crosses-both-nodes');
  await expect(designPage.canvas).toBeVisible();

  await drawClosedSquareAt(designPage, 900, 300); // A: x 900..1000
  await paintWholeSquareAt(designPage, page, 900, 300);
  await exitVectorEditMode(designPage);

  await drawClosedSquareAt(designPage, 1100, 300); // B: x 1100..1200, close enough for one stroke to dip into both
  await paintWholeSquareAt(designPage, page, 1100, 300);
  await exitVectorEditMode(designPage);

  const before = await readDesignState(page);
  const [idA, idB] = before.rootOrder;

  await openMultipleViaEnter(designPage, page, [
    { x: 950, y: 350 },
    { x: 1150, y: 350 },
  ]);

  await page.keyboard.press('Shift+E');
  // one continuous stroke: dip through A's top edge, travel across the gap (y=285, above both
  // squares — never touches either interior in between), then dip through B's top edge
  await designPage.dragEraseBrush([
    { x: 950, y: 285 },
    { x: 950, y: 340 },
    { x: 950, y: 285 },
    { x: 1150, y: 285 },
    { x: 1150, y: 340 },
    { x: 1150, y: 285 },
  ]);

  const after = await readDesignState(page);

  [
    [idA, before.nodes[idA]],
    [idB, before.nodes[idB]],
  ].forEach(([id, beforeNode]) => {
    const nodeId = id as string;
    const beforeSegmentCount = Object.keys((beforeNode as TDesignSnapshot['nodes'][string]).segments).length;

    expect(Object.keys(after.nodes[nodeId].segments).length).toBeGreaterThan(beforeSegmentCount);
    expect(after.nodes[nodeId].filledFaceKeys!.length).toBeGreaterThan(0);
  });
});

test('a single Undo after one drag that erased through both open nodes reverts both back to their original filled state at once', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-erase-multi-undo-both-nodes');
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

  await page.keyboard.press('Shift+E');
  await designPage.dragEraseBrush([
    { x: 950, y: 285 },
    { x: 950, y: 340 },
    { x: 950, y: 285 },
    { x: 1150, y: 285 },
    { x: 1150, y: 340 },
    { x: 1150, y: 285 },
  ]);

  const afterErase = await readDesignState(page);

  // sanity check: the drag actually touched both
  before.rootOrder.forEach((id) => {
    expect(Object.keys(afterErase.nodes[id].segments).length).toBeGreaterThan(Object.keys(before.nodes[id].segments).length);
  });

  await page.keyboard.press('Control+z');

  const afterUndo = await readDesignState(page);

  before.rootOrder.forEach((id) => expect(afterUndo.nodes[id]).toEqual(before.nodes[id]));
});
