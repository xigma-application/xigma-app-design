import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('dragging a Smart Selection gap handle grows the gap uniformly, keeps the first element fixed, and undoes in one step', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-gap-drag');
  await expect(designPage.canvas).toBeVisible();

  // two rectangles with a gap between them
  await designPage.drawRectangle(700, 300, 750, 350); // A — auto-selected on creation
  await designPage.drawRectangle(800, 300, 850, 350); // B — auto-selected, replacing A's selection
  await designPage.click(720, 320, { shift: true }); // add A back to the selection alongside B

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return { nodes: activePage.nodes, rootOrder: activePage.rootOrder };
  });

  const [idA, idB] = before.rootOrder;
  const nodeA = before.nodes[idA] as { height: number; width: number; x: number; y: number };
  const nodeB = before.nodes[idB] as { height: number; width: number; x: number; y: number };
  const gapMidX = (nodeA.x + nodeA.width + nodeB.x) / 2;
  const gapMidY = nodeA.y + nodeA.height / 2;
  const growBy = 30;

  await designPage.pointerDown(gapMidX, gapMidY);
  await page.mouse.move(gapMidX + growBy, gapMidY, { steps: 5 });
  await designPage.pointerUp();

  const afterDrag = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  // A (the anchor) stays put; the handle sits at the gap's midpoint, which is anchored on one
  // side only, so B must shift by 2x the pointer's own movement for the midpoint to track the
  // pointer 1:1
  expect(afterDrag[idA]).toMatchObject({ x: nodeA.x, y: nodeA.y });
  expect(afterDrag[idB]).toMatchObject({ x: nodeB.x + growBy * 2, y: nodeB.y });

  await page.keyboard.press('Control+z');

  const afterUndo = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  expect(afterUndo[idA]).toMatchObject({ x: nodeA.x, y: nodeA.y });
  expect(afterUndo[idB]).toMatchObject({ x: nodeB.x, y: nodeB.y });
});

test('dragging a Smart Selection swap handle onto another block reorders the row with shift, and undoes in one step', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-swap-drag');
  await expect(designPage.canvas).toBeVisible();

  // three evenly spaced rectangles in a row
  await designPage.drawRectangle(700, 300, 750, 350); // A
  await designPage.drawRectangle(800, 300, 850, 350); // B
  await designPage.drawRectangle(900, 300, 950, 350); // C — selected on creation
  await designPage.click(720, 320, { shift: true }); // + A
  await designPage.click(820, 320, { shift: true }); // + B

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return { nodes: activePage.nodes, rootOrder: activePage.rootOrder };
  });

  const [idA, idB, idC] = before.rootOrder;
  const nodeA = before.nodes[idA] as { height: number; width: number; x: number; y: number };
  const nodeB = before.nodes[idB] as { x: number; y: number };
  const nodeC = before.nodes[idC] as { x: number; y: number };
  const centreY = nodeA.y + nodeA.height / 2;
  const centreX = (id: { x: number; width: number }): number => id.x + id.width / 2;

  // drag A's swap handle onto C's slot
  await designPage.pointerDown(centreX(nodeA), centreY);
  await page.mouse.move(centreX({ width: nodeA.width, x: nodeC.x }), centreY, { steps: 6 });
  await designPage.pointerUp();

  const afterDrag = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  // [A, B, C] -> [B, C, A]: each block lands on a former slot origin
  expect(afterDrag[idA]).toMatchObject({ x: nodeC.x, y: nodeA.y });
  expect(afterDrag[idB]).toMatchObject({ x: nodeA.x, y: nodeA.y });
  expect(afterDrag[idC]).toMatchObject({ x: nodeB.x, y: nodeA.y });

  await page.keyboard.press('Control+z');

  const afterUndo = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  expect(afterUndo[idA]).toMatchObject({ x: nodeA.x, y: nodeA.y });
  expect(afterUndo[idB]).toMatchObject({ x: nodeB.x, y: nodeA.y });
  expect(afterUndo[idC]).toMatchObject({ x: nodeC.x, y: nodeA.y });
});

test('hovering a Smart Selection gap handle switches the cursor to move-x and back to default off it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-gap-hover');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 750, 350); // A — auto-selected on creation
  await designPage.drawRectangle(800, 300, 850, 350); // B — auto-selected, replacing A's selection
  await designPage.click(720, 320, { shift: true }); // add A back to the selection alongside B

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return { nodes: activePage.nodes, rootOrder: activePage.rootOrder };
  });

  const [idA, idB] = before.rootOrder;
  const nodeA = before.nodes[idA] as { height: number; width: number; x: number; y: number };
  const nodeB = before.nodes[idB] as { height: number; width: number; x: number; y: number };
  const gapMidX = (nodeA.x + nodeA.width + nodeB.x) / 2;
  const gapMidY = nodeA.y + nodeA.height / 2;

  await designPage.pointerMove(gapMidX, gapMidY);
  await expect(designPage.canvas).toHaveClass(/move-x/);

  await designPage.pointerMove(gapMidX, gapMidY + 200);
  await expect(designPage.canvas).not.toHaveClass(/move-x/);
});
