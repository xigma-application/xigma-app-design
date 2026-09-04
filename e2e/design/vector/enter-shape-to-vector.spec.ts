import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TDesignSnapshot = {
  nodes: Record<
    string,
    {
      childIds?: string[];
      endPoint?: string;
      defaultFill?: unknown;
      startPoint?: string;
      type: string;
      vertices?: Record<string, { x: number; y: number }>;
    }
  >;
  rootOrder: string[];
  selectedIds: string[];
  vectorEditingNodeIds: string[];
};

// same readDesignState shape/convention as vector-edit-multi.spec.ts's own helper
const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages, vectorEditingNodeIds } = store.getState().design;
    const { nodes, rootOrder, selectedIds } = pages[activePageId];

    return { nodes, rootOrder, selectedIds, vectorEditingNodeIds };
  });

const hasVertexNear = (vertices: Record<string, { x: number; y: number }> | undefined, x: number, y: number): boolean =>
  Object.values(vertices ?? {}).some((vertex) => Math.abs(vertex.x - x) < 3 && Math.abs(vertex.y - y) < 3);

test('pressing Enter on a selected Rectangle converts it into a genuinely editable vector node', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-enter-rectangle-to-vector');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 420); // commits and selects it, activeTool -> default
  await designPage.pointerMove(1500, 700);
  const beforeEnter = await designPage.canvas.screenshot();

  await page.keyboard.press('Enter');
  await designPage.pointerMove(1500, 700);
  const afterEnter = await designPage.canvas.screenshot();

  expect(afterEnter.equals(beforeEnter)).toBe(false);

  const stateAfterEnter = await readDesignState(page);
  const [id] = stateAfterEnter.rootOrder;

  expect(stateAfterEnter.nodes[id].type).toBe('vector');
  expect(stateAfterEnter.vectorEditingNodeIds).toEqual([id]);
  expect(Object.keys(stateAfterEnter.nodes[id].vertices ?? {})).toHaveLength(4);
  expect(hasVertexNear(stateAfterEnter.nodes[id].vertices, 900, 300)).toBe(true);

  // drag the corner vertex at (900,300) to prove it is a real, editable vector node now — not just a
  // relabeled rectangle that happens to report type: 'vector'
  await designPage.dragVectorPoint(900, 300, 850, 250);
  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(afterEnter)).toBe(false);

  const stateAfterDrag = await readDesignState(page);

  expect(hasVertexNear(stateAfterDrag.nodes[id].vertices, 850, 250)).toBe(true);
});

test('Ctrl+Z immediately after converting a Rectangle to a vector restores the original rectangle in one step', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-enter-rectangle-undo');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1050, 420);
  await designPage.pointerMove(1500, 700);
  const beforeEnter = await designPage.canvas.screenshot();

  await page.keyboard.press('Enter');

  const converted = await readDesignState(page);
  const [id] = converted.rootOrder;

  expect(converted.nodes[id].type).toBe('vector');

  await page.keyboard.press('Control+z');
  await designPage.pointerMove(1500, 700);
  const afterUndo = await designPage.canvas.screenshot();

  expect(afterUndo.equals(beforeEnter)).toBe(true);

  const restored = await readDesignState(page);

  expect(restored.nodes[id].type).toBe('rectangle');
  expect(restored.rootOrder).toEqual([id]);
});

test('pressing Enter on a selected Arrow converts it to a vector but drops its arrowhead, since a vector segment has no equivalent', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-enter-arrow-drops-arrowhead');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectToolFromDropdown('rectangle', 'Arrow');
  await designPage.pointerDown(900, 300);
  await designPage.pointerMove(1100, 300);
  await designPage.pointerUp();
  await designPage.selectTool('default');
  await designPage.click(1000, 300); // select the arrow (a line's own hit-test, tolerant near its body)
  await designPage.pointerMove(1500, 700);
  const beforeEnter = await designPage.canvas.screenshot(); // arrowhead visible at (1100,300)

  await page.keyboard.press('Enter');
  await designPage.pointerMove(1500, 700);
  const afterEnter = await designPage.canvas.screenshot();

  expect(afterEnter.equals(beforeEnter)).toBe(false); // the arrowhead visibly disappeared

  const state = await readDesignState(page);
  const [id] = state.rootOrder;
  const node = state.nodes[id];

  expect(node.type).toBe('vector');
  expect(node.defaultFill).toBeNull();
  expect(node).not.toHaveProperty('startPoint');
  expect(node).not.toHaveProperty('endPoint');
  expect(Object.keys(node.vertices ?? {})).toHaveLength(2);
  expect(hasVertexNear(node.vertices, 900, 300)).toBe(true);
  expect(hasVertexNear(node.vertices, 1100, 300)).toBe(true);
});

test('pressing Enter with a mixed multi-selection (Rectangle + Ellipse) converts and opens every eligible shape at once', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-enter-mixed-multi-select');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 400);
  await designPage.drawEllipse(1100, 300, 1200, 400);

  await designPage.click(950, 350); // select the rectangle
  await designPage.click(1150, 350, { shift: true }); // add the ellipse to the selection

  await page.keyboard.press('Enter');

  const state = await readDesignState(page);
  const [rectangleId, ellipseId] = state.rootOrder;

  expect(state.nodes[rectangleId].type).toBe('vector');
  expect(state.nodes[ellipseId].type).toBe('vector');
  expect(state.vectorEditingNodeIds.slice().sort()).toEqual([rectangleId, ellipseId].sort());
});

test('pressing Enter with a mixed multi-selection (Rectangle + Text) also flattens the text into its own vector, alongside the converted shape', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-enter-mixed-shape-and-text');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1000, 400);
  await designPage.drawTextBox(1100, 300, 1300, 400);
  await designPage.typeText('Hi');
  await page.keyboard.press('Escape'); // commits the text, stays selected

  const [rectangleId, textId] = (await readDesignState(page)).rootOrder;

  await designPage.click(950, 350); // select the rectangle
  await designPage.click(1105, 308, { shift: true }); // add the text — on its rendered "Hi" glyphs, text hit-testing is glyph-precise not bbox

  await page.keyboard.press('Enter');

  // flattening text (real glyph-outline work, no mocked font atlas here) is genuinely slow — poll
  // instead of reading state right after the keypress
  await expect.poll(async () => (await readDesignState(page)).nodes[textId]?.type, { timeout: 15000 }).toBe('vector');

  const state = await readDesignState(page);

  expect(state.nodes[rectangleId].type).toBe('vector');
  // each keeps its own, separate vector geometry — a multi-convert must never merge them into one
  expect(state.nodes[rectangleId]).not.toBe(state.nodes[textId]);
  expect(state.vectorEditingNodeIds.slice().sort()).toEqual([rectangleId, textId].sort());
});

test('pressing Enter progressively drills through nested Frames — one level per press — before finally converting every leaf Rectangle', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-enter-drill-nested-frames');
  await expect(designPage.canvas).toBeVisible();

  // R1, F_outer, R2 at the top level; F_outer's only child is F_inner, which holds R3 and R4 —
  // i.e. R, F[F[R,R]], R
  await designPage.drawRectangle(700, 300, 740, 340); // R1
  await designPage.click(1500, 700);
  await designPage.drawFrame(800, 300, 900, 400); // F_outer
  await designPage.click(1500, 700);
  await designPage.drawRectangle(950, 300, 990, 340); // R2
  await designPage.click(1500, 700);
  await designPage.drawFrame(1050, 300, 1150, 400); // F_inner
  await designPage.click(1500, 700);
  await designPage.drawRectangle(1200, 300, 1240, 340); // R3
  await designPage.click(1500, 700);
  await designPage.drawRectangle(1260, 300, 1300, 340); // R4
  await designPage.click(1500, 700);

  const [rectangleId1, outerFrameId, rectangleId2, innerFrameId, rectangleId3, rectangleId4] = (await readDesignState(page)).rootOrder;

  await page.evaluate(
    async ([innerFrameId, outerFrameId, rectangleId3, rectangleId4]) => {
      const { store } = await import('/src/store/index.ts');
      const { moveNodes } = await import('/src/store/design/slice.ts');

      store.dispatch(moveNodes({ nodeIds: [rectangleId3, rectangleId4], targetIndex: 0, targetParentId: innerFrameId }));
      store.dispatch(moveNodes({ nodeIds: [innerFrameId], targetIndex: 0, targetParentId: outerFrameId }));
    },
    [innerFrameId, outerFrameId, rectangleId3, rectangleId4],
  );

  await designPage.click(720, 320); // select R1
  // F_outer now has a child, making it a click-through root frame (isClickThroughFrame) — its own
  // body no longer hit-tests to itself, so it must be selected via its name label instead
  await designPage.click(815, 288, { shift: true }); // add F_outer, via its name label
  await designPage.click(970, 320, { shift: true }); // add R2

  expect((await readDesignState(page)).selectedIds).toEqual([rectangleId1, outerFrameId, rectangleId2]);

  // 1st Enter: F_outer is the only container in the selection — it expands to its one child,
  // F_inner; R1/R2 are untouched, and nothing converts yet
  await page.keyboard.press('Enter');

  let state = await readDesignState(page);

  expect(state.selectedIds).toEqual([rectangleId1, innerFrameId, rectangleId2]);
  expect(state.vectorEditingNodeIds).toEqual([]);

  // 2nd Enter: F_inner is still a container — it expands to its two rectangles
  await page.keyboard.press('Enter');

  state = await readDesignState(page);

  expect(state.selectedIds).toEqual([rectangleId1, rectangleId3, rectangleId4, rectangleId2]);
  expect(state.vectorEditingNodeIds).toEqual([]);

  // 3rd Enter: every selected node is now a plain rectangle — no containers left, so this press
  // finally converts and opens all four for editing
  await page.keyboard.press('Enter');

  state = await readDesignState(page);

  expect(state.nodes[rectangleId1].type).toBe('vector');
  expect(state.nodes[rectangleId2].type).toBe('vector');
  expect(state.nodes[rectangleId3].type).toBe('vector');
  expect(state.nodes[rectangleId4].type).toBe('vector');
  expect(state.vectorEditingNodeIds).toEqual([rectangleId1, rectangleId3, rectangleId4, rectangleId2]);
});
