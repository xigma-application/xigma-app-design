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

test('holding shift while dragging a Smart Selection gap handle snaps the gap to the nearest 10', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-gap-drag-shift-snap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 750, 350); // A
  await designPage.drawRectangle(800, 300, 850, 350); // B
  await designPage.click(720, 320, { shift: true }); // add A back to the selection alongside B

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return { nodes: activePage.nodes, rootOrder: activePage.rootOrder };
  });

  const [idA, idB] = before.rootOrder;
  const nodeA = before.nodes[idA] as { height: number; width: number; x: number; y: number };
  const nodeB = before.nodes[idB] as { x: number; y: number };
  const gapMidX = nodeA.x + nodeA.width + 25;
  const gapMidY = nodeA.y + nodeA.height / 2;

  await designPage.pointerDown(gapMidX, gapMidY);
  await page.keyboard.down('Shift');
  // pointer moves 17: raw gap = 50 + 2*17 = 84, which snaps to 80
  await page.mouse.move(gapMidX + 17, gapMidY, { steps: 5 });
  await page.keyboard.up('Shift');
  await designPage.pointerUp();

  const afterDrag = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  expect(afterDrag[idA]).toMatchObject({ x: nodeA.x, y: nodeA.y });
  expect(afterDrag[idB]).toMatchObject({ x: nodeB.x + 30, y: nodeB.y });
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

test('dragging a Smart Selection swap handle onto an empty grid cell relocates only that block, and undoes in one step', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-swap-hole');
  await expect(designPage.canvas).toBeVisible();

  // 3-column, 2-row grid (50px cells, 50px gaps) with the middle-bottom cell left empty
  const spots = [
    [700, 300],
    [800, 300],
    [900, 300],
    [700, 400],
    [900, 400],
  ];

  for (const [x, y] of spots) {
    await designPage.drawRectangle(x, y, x + 50, y + 50);
  }
  for (const [x, y] of spots.slice(0, -1)) {
    await designPage.click(x + 25, y + 25, { shift: true });
  }

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return { nodes: activePage.nodes, rootOrder: activePage.rootOrder };
  });

  const idA = before.rootOrder[0];
  const others = before.rootOrder.slice(1);
  const originals = Object.fromEntries(before.rootOrder.map((id) => [id, before.nodes[id] as { x: number; y: number }]));

  // drag A's swap handle onto the empty centre cell (825, 425)
  await designPage.pointerDown(725, 325);
  await page.mouse.move(825, 425, { steps: 6 });
  await designPage.pointerUp();

  const afterDrag = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  // A relocated into the hole; everyone else untouched
  expect(afterDrag[idA]).toMatchObject({ x: 800, y: 400 });
  for (const id of others) {
    expect(afterDrag[id]).toMatchObject({ x: originals[id].x, y: originals[id].y });
  }

  await page.keyboard.press('Control+z');

  const afterUndo = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  expect(afterUndo[idA]).toMatchObject({ x: originals[idA].x, y: originals[idA].y });
});

test('clicking the Smart Selection suggestion icon equalizes an aligned row with uneven gaps, and undoes in one step', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-suggestion-equalize');
  await expect(designPage.canvas).toBeVisible();

  // A, B (gap 40 from A), C (gap 90 from B) — aligned but not uniform
  await designPage.drawRectangle(700, 300, 750, 350); // A
  await designPage.drawRectangle(790, 300, 840, 350); // B
  await designPage.drawRectangle(930, 300, 980, 350); // C — selected on creation
  await designPage.click(720, 320, { shift: true }); // + A
  await designPage.click(810, 320, { shift: true }); // + B

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return { nodes: activePage.nodes, rootOrder: activePage.rootOrder };
  });

  const [idA, idB, idC] = before.rootOrder;

  // icon sits at the selection bbox's bottom-right (980, 350) + an 8px margin, 24px square
  await designPage.pointerDown(1000, 370);
  await designPage.pointerUp();

  const afterClick = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  // gaps become the mean of 40 and 90 = 65; a stays put; c is invariant (2-gap mean preserves the span)
  expect(afterClick[idA]).toMatchObject({ x: 700, y: 300 });
  expect(afterClick[idB]).toMatchObject({ x: 815, y: 300 });
  expect(afterClick[idC]).toMatchObject({ x: 930, y: 300 });

  await page.keyboard.press('Control+z');

  const afterUndo = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  expect(afterUndo[idA]).toMatchObject({ x: 700, y: 300 });
  expect(afterUndo[idB]).toMatchObject({ x: 790, y: 300 });
  expect(afterUndo[idC]).toMatchObject({ x: 930, y: 300 });
});

test('clicking the Smart Selection suggestion icon appends a spatial outlier to a clean row, and undoes in one step', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-suggestion-append');
  await expect(designPage.canvas).toBeVisible();

  // A, B, C form a clean row (gap 50); D is a spatial outlier past C
  await designPage.drawRectangle(700, 300, 750, 350); // A
  await designPage.drawRectangle(800, 300, 850, 350); // B
  await designPage.drawRectangle(900, 300, 950, 350); // C
  await designPage.drawRectangle(1100, 600, 1150, 650); // D — selected on creation
  await designPage.click(725, 325, { shift: true }); // + A
  await designPage.click(825, 325, { shift: true }); // + B
  await designPage.click(925, 325, { shift: true }); // + C

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return { nodes: activePage.nodes, rootOrder: activePage.rootOrder };
  });

  const [idA, idB, idC, idD] = before.rootOrder;

  // icon sits at the selection bbox's bottom-right (1150, 650) + an 8px margin, 24px square
  await designPage.pointerDown(1170, 670);
  await designPage.pointerUp();

  const afterClick = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  // d lands right after c (gap 50), its y snapped to the row's y=300; a/b/c untouched
  expect(afterClick[idD]).toMatchObject({ x: 1000, y: 300 });
  expect(afterClick[idA]).toMatchObject({ x: 700, y: 300 });
  expect(afterClick[idB]).toMatchObject({ x: 800, y: 300 });
  expect(afterClick[idC]).toMatchObject({ x: 900, y: 300 });

  await page.keyboard.press('Control+z');

  const afterUndo = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes;
  });

  expect(afterUndo[idD]).toMatchObject({ x: 1100, y: 600 });
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
