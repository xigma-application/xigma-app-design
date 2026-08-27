import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

type TDesignSnapshot = {
  nodes: Record<
    string,
    {
      endPoint?: string;
      fillColor?: string | null;
      startPoint?: string;
      type: string;
      vertices?: Record<string, { x: number; y: number }>;
    }
  >;
  rootOrder: string[];
  vectorEditingNodeIds: string[];
};

// same readDesignState shape/convention as vector-edit-multi.spec.ts's own helper
const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { nodes, rootOrder, vectorEditingNodeIds } = store.getState().design;

    return { nodes, rootOrder, vectorEditingNodeIds };
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
  expect(node.fillColor).toBeNull();
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
