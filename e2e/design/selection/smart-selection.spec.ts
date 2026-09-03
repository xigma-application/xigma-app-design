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

  // A (the anchor) stays put; B shifts right by exactly the gap growth
  expect(afterDrag[idA]).toMatchObject({ x: nodeA.x, y: nodeA.y });
  expect(afterDrag[idB]).toMatchObject({ x: nodeB.x + growBy, y: nodeB.y });

  await page.keyboard.press('Control+z');

  const afterUndo = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  expect(afterUndo[idA]).toMatchObject({ x: nodeA.x, y: nodeA.y });
  expect(afterUndo[idB]).toMatchObject({ x: nodeB.x, y: nodeB.y });
});
