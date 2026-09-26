import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const dragRowOnto = async (from: Locator, to: Locator): Promise<void> => {
  const fromBox = await from.boundingBox();
  const toBox = await to.boundingBox();

  if (!fromBox || !toBox) {
    throw new Error('row bounding box unavailable');
  }

  const page = from.page();

  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });
  await page.mouse.up();
};

test('the Boolean operations button wraps a rectangle in a Union, a dropped rectangle joins it and a menu pick switches it to Subtract', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-operations');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await page.getByLabel('Boolean operations', { exact: true }).click();

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await expect(rows.filter({ hasText: 'Union' })).toHaveCount(1);
  await expect(page.locator('[data-test-component-header="boolean"]').getByText('Union', { exact: true })).toBeVisible();

  await designPage.drawRectangle(760, 260, 880, 380);
  await designPage.click(1500, 600);
  await expect(rows).toHaveCount(2);

  await dragRowOnto(rows.filter({ hasText: 'Rectangle' }), rows.filter({ hasText: 'Union' }));
  await expect(rows).toHaveCount(1);

  await page.getByRole('button', { name: 'Expand layer' }).click();
  await expect(rows.filter({ hasText: 'Rectangle' })).toHaveCount(2);

  await rows.filter({ hasText: 'Union' }).click();

  const safeArea = await designPage.canvasSafeArea();
  const unionShot = await page.screenshot({ clip: safeArea });

  await page.getByLabel('Boolean operations options').click();
  await page.getByText('Subtract', { exact: true }).click();

  await expect(page.locator('[data-test-component-header="boolean"]').getByText('Subtract', { exact: true })).toBeVisible();
  await expect(rows.filter({ hasText: 'Subtract' })).toHaveCount(1);

  const subtractShot = await page.screenshot({ clip: safeArea });

  expect(subtractShot.equals(unionShot)).toBe(false);
});

test('a frame dropped on a Union row stays outside it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-frame-drop');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await page.getByLabel('Boolean operations', { exact: true }).click();
  await designPage.drawFrame(1000, 200, 1100, 300);
  await designPage.click(1500, 600);

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await expect(rows).toHaveCount(2);

  await dragRowOnto(rows.filter({ hasText: 'Frame' }), rows.filter({ hasText: 'Union' }));

  await expect(rows).toHaveCount(2);
  await expect(rows.filter({ hasText: 'Frame' })).toHaveCount(1);
});

test('wrapping a rectangle in a Union keeps its fill color on the canvas instead of a per-face placeholder color', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-fill-color');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);

  const clip = { height: 100, width: 100, x: 710, y: 210 };
  const before = await page.screenshot({ clip });

  await page.getByLabel('Boolean operations', { exact: true }).click();
  await expect(page.locator('[data-test-component-header="boolean"]')).toBeVisible();

  const after = await page.screenshot({ clip });

  expect(after.equals(before)).toBe(true);
});

test('Flatten from the Boolean menu turns a Union into a single vector without children and keeps its look', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-flatten');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await page.getByLabel('Boolean operations', { exact: true }).click();
  await designPage.drawRectangle(760, 260, 880, 380);
  await designPage.click(1500, 600);

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await dragRowOnto(rows.filter({ hasText: 'Rectangle' }), rows.filter({ hasText: 'Union' }));
  await designPage.click(1500, 600);

  const clip = { height: 200, width: 200, x: 690, y: 190 };
  const before = await page.screenshot({ clip });

  await rows.filter({ hasText: 'Union' }).click();
  await page.getByLabel('Boolean operations options').click();
  await page.getByText('Flatten', { exact: true }).click();

  await expect(page.getByRole('button', { name: 'Expand layer' })).toHaveCount(0);
  await expect(page.locator('[data-test-component-header="boolean"]')).toHaveCount(0);

  await designPage.click(1500, 600);

  const after = await page.screenshot({ clip });

  expect(after.equals(before)).toBe(true);
});

test('dragging a Union that contains a vector moves the vector part live instead of leaving it behind until release', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-vector-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawRectangle(760, 260, 880, 380);
  await page.keyboard.press('Alt+Shift+F');
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
    store.dispatch(booleanNodes('union'));
  });

  const vectorOnlyArea = { height: 30, width: 30, x: 840, y: 340 };
  const emptyArea = { height: 30, width: 30, x: 1300, y: 700 };
  const blank = await page.screenshot({ clip: emptyArea });

  await page.mouse.move(790, 290);
  await page.mouse.down();
  await page.mouse.move(1090, 590, { steps: 5 });

  const duringDrag = await page.screenshot({ clip: vectorOnlyArea });

  await page.mouse.up();

  expect(duringDrag.equals(blank)).toBe(true);
});

test('a selected unfilled vector inside a Union can be grabbed anywhere within its frame and moves on its own', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-vector-grab');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawRectangle(760, 260, 880, 380);
  await page.keyboard.press('Alt+Shift+F');
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection, updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    store.dispatch(updateNode({ changes: { filledFaceKeys: [] }, id: rootOrder[1] }));
    store.dispatch(setSelection(rootOrder));
    store.dispatch(booleanNodes('union'));
    store.dispatch(setSelection([rootOrder[1]]));
  });

  await page.mouse.move(850, 350);
  await page.mouse.down();
  await page.mouse.move(950, 450, { steps: 5 });
  await page.mouse.up();

  const positions = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, selectedIds } = pages[activePageId];
    const rectangle = Object.values(nodes).find((node) => node.type === 'rectangle') as { x: number; y: number };

    return { rectangle: { x: rectangle.x, y: rectangle.y }, selectedType: nodes[selectedIds[0]].type };
  });

  expect(positions.selectedType).toBe('vector');
  expect(positions.rectangle).toEqual({ x: 700, y: 200 });
});

test('an unfilled vector dropped into a Union is drawn as its stroke shape in the Union fill, not in its own stroke color', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-stroke-shape');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 900, 380);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes } = await import('/src/store/design/slice.ts');
    const vertices = {
      a: { id: 'a', x: 950, y: 500 },
      b: { id: 'b', x: 1150, y: 500 },
      c: { id: 'c', x: 1150, y: 700 },
      d: { id: 'd', x: 950, y: 700 },
    };
    const segments = Object.fromEntries(
      [
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'd'],
        ['d', 'a'],
      ].map(([startId, endId], index) => [`s${index}`, { endId, id: `s${index}`, startId, tangentEnd: null, tangentStart: null }]),
    );

    store.dispatch(
      addNodes({
        nodes: [
          {
            defaultFill: null,
            filledFaceKeys: [],
            id: 'outlineVector',
            name: 'Vector',
            parentId: null,
            rotation: 0,
            segments,
            strokeWidth: 6,
            strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
            type: 'vector',
            vertexHandleModes: {},
            vertices,
          },
        ],
        rootIds: ['outlineVector'],
      } as never),
    );
  });
  await designPage.click(1500, 900);

  const edge = { height: 6, width: 40, x: 1030, y: 497 };
  const before = await page.screenshot({ clip: edge });

  await designPage.click(800, 290);
  await page.getByLabel('Boolean operations', { exact: true }).click();
  await designPage.click(1500, 900);

  const rows = page.locator('[class*="LayersTree"]').first().locator('[class*="Tree__row_"]');

  await dragRowOnto(rows.filter({ hasText: 'Vector' }), rows.filter({ hasText: 'Union' }));
  await expect(rows).toHaveCount(1);
  await designPage.click(1500, 900);

  const after = await page.screenshot({ clip: edge });
  const rectangleFill = await page.screenshot({ clip: { height: 6, width: 40, x: 780, y: 287 } });

  expect(after.equals(before)).toBe(false);
  expect(after.equals(rectangleFill)).toBe(true);
});

test('two selected rectangles show the Rectangle panel and its Boolean button wraps both in one Union', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-multi-rectangles');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawRectangle(760, 260, 880, 380);
  await designPage.click(720, 220, { shift: true });

  await expect(page.locator('[data-test-component-header="rectangle"]')).toBeVisible();

  await page.getByLabel('Boolean operations', { exact: true }).click();

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  await expect(rows).toHaveCount(1);
  await page.getByRole('button', { name: 'Expand layer' }).click();
  await expect(rows.filter({ hasText: 'Rectangle' })).toHaveCount(2);
});

const unionRectangleAndLine = async (page: Page, designPage: DesignPage): Promise<void> => {
  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawLine(780, 260, 1000, 260);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
    store.dispatch(booleanNodes('union'));
  });
};

const LINE_ONLY_AREA = { height: 20, width: 60, x: 900, y: 250 };
const EMPTY_AREA = { height: 20, width: 60, x: 1300, y: 700 };

test('a line joined into a Union with a rectangle stays visible as its stroke shape', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-line-visible');
  await expect(designPage.canvas).toBeVisible();

  await unionRectangleAndLine(page, designPage);
  await designPage.click(1500, 900);

  const blank = await page.screenshot({ clip: EMPTY_AREA });
  const lineArea = await page.screenshot({ clip: LINE_ONLY_AREA });

  expect(lineArea.equals(blank)).toBe(false);
});

test('a diagonal line joined into a Union is drawn along its own direction, not turned a second time', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-diagonal-line');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawLine(780, 260, 1000, 420);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
    store.dispatch(booleanNodes('union'));
  });
  await designPage.click(1500, 900);

  const blank = await page.screenshot({ clip: { height: 20, width: 20, x: 1100, y: 370 } });

  await expect.poll(async () => (await page.screenshot({ clip: { height: 20, width: 20, x: 935, y: 370 } })).equals(blank)).toBe(false);
});

test('dragging a Union that contains a line moves the line part live instead of leaving it behind until release', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-line-drag');
  await expect(designPage.canvas).toBeVisible();

  await unionRectangleAndLine(page, designPage);

  const blank = await page.screenshot({ clip: EMPTY_AREA });

  await page.mouse.move(740, 240);
  await page.mouse.down();
  await page.mouse.move(1040, 540, { steps: 5 });

  const duringDrag = await page.screenshot({ clip: LINE_ONLY_AREA });

  await page.mouse.up();

  expect(duringDrag.equals(blank)).toBe(true);
});

test('a selected line inside a Union can be grabbed on its stroke and moves on its own', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-line-grab');
  await expect(designPage.canvas).toBeVisible();

  await unionRectangleAndLine(page, designPage);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const line = Object.values(pages[activePageId].nodes).find((node) => node.type === 'line');

    store.dispatch(setSelection([line?.id ?? '']));
  });

  await page.mouse.move(950, 260);
  await page.mouse.down();
  await page.mouse.move(950, 360, { steps: 5 });
  await page.mouse.up();

  const result = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, selectedIds } = pages[activePageId];
    const rectangle = Object.values(nodes).find((node) => node.type === 'rectangle') as { x: number; y: number };
    const line = Object.values(nodes).find((node) => node.type === 'line') as { y: number };

    return { lineY: line.y, rectangle: { x: rectangle.x, y: rectangle.y }, selectedType: nodes[selectedIds[0]].type };
  });

  expect(result.selectedType).toBe('line');
  expect(result.rectangle).toEqual({ x: 700, y: 200 });
  expect(result.lineY).toBe(360);
});

test('an arrow joined into a Union with a rectangle keeps its arrowhead', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-arrow-head');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawLine(780, 260, 1000, 260);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection, updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const line = Object.values(nodes).find((node) => node.type === 'line');

    store.dispatch(updateNode({ changes: { endPoint: 'lineArrow' } as never, id: line?.id ?? '' }));
    store.dispatch(setSelection(rootOrder));
    store.dispatch(booleanNodes('union'));
  });
  await designPage.click(1500, 900);

  const wingArea = { height: 3, width: 4, x: 994, y: 255 };
  const blank = await page.screenshot({ clip: { ...wingArea, x: 1300, y: 700 } });
  const wing = await page.screenshot({ clip: wingArea });

  expect(wing.equals(blank)).toBe(false);
});

test('a Union with a gradient stroke draws that stroke around its shape', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-gradient-stroke');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawRectangle(760, 260, 880, 380);

  const setUnionStrokes = (strokes: unknown[]): Promise<void> =>
    page.evaluate(async (nextStrokes) => {
      const { store } = await import('/src/store/index.ts');
      const { setSelection, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const union = Object.values(pages[activePageId].nodes).find((node) => node.type === 'boolean');

      store.dispatch(updateNode({ changes: { strokeWidth: 6, strokes: nextStrokes } as never, id: union?.id ?? '' }));
      store.dispatch(setSelection([]));
    }, strokes);

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
    store.dispatch(booleanNodes('union'));
  });

  const edgeArea = { height: 40, width: 8, x: 694, y: 240 };

  await setUnionStrokes([]);
  const withoutStroke = await page.screenshot({ clip: edgeArea });

  await setUnionStrokes([
    {
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ff0000', opacity: 100, position: 0 },
        { color: '#0000ff', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    },
  ]);
  const withStroke = await page.screenshot({ clip: edgeArea });

  expect(withStroke.equals(withoutStroke)).toBe(false);
});

test('flattening a Union with a gradient stroke keeps the gradient stroke', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-flatten-gradient-stroke');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawRectangle(760, 260, 880, 380);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection, updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
    store.dispatch(booleanNodes('union'));

    const union = Object.values(store.getState().design.pages[activePageId].nodes).find((node) => node.type === 'boolean');
    const strokes = [
      {
        end: { x: 1, y: 0.5 },
        opacity: 100,
        start: { x: 0, y: 0.5 },
        stops: [
          { color: '#ff0000', opacity: 100, position: 0 },
          { color: '#0000ff', opacity: 100, position: 1 },
        ],
        type: 'gradient-linear',
      },
    ];

    store.dispatch(updateNode({ changes: { strokeWidth: 4, strokes } as never, id: union?.id ?? '' }));
    store.dispatch(setSelection([union?.id ?? '']));
  });
  await page.keyboard.press('Alt+Shift+F');

  const flattened = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const node = nodes[rootOrder[0]] as unknown as { strokeWidth: number; strokes: { type: string }[]; type: string };

    return { strokeTypes: node.strokes.map((stroke) => stroke.type), strokeWidth: node.strokeWidth, type: node.type };
  });

  expect(flattened).toEqual({ strokeTypes: ['gradient-linear'], strokeWidth: 4, type: 'vector' });
});

test('a thick stroke on a Union of thin lines is drawn as a solid band, not a hollow outline with a line through it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-thick-stroke-thin-shape');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawLine(700, 300, 1000, 300);
  await designPage.drawLine(850, 200, 850, 450);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection, updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
    store.dispatch(booleanNodes('union'));

    const union = Object.values(store.getState().design.pages[activePageId].nodes).find((node) => node.type === 'boolean');

    store.dispatch(
      updateNode({
        changes: { strokeWidth: 30, strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }] } as never,
        id: union?.id ?? '',
      }),
    );
    store.dispatch(setSelection([]));
  });
  await designPage.click(1500, 900);

  const blank = await page.screenshot({ clip: { height: 4, width: 4, x: 760, y: 360 } });

  await expect.poll(async () => (await page.screenshot({ clip: { height: 4, width: 4, x: 760, y: 305 } })).equals(blank)).toBe(false);
});

test('a dashed line joined into a Union keeps the gaps between its dashes', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-dashed-line');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawLine(820, 260, 1020, 260);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection, updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const lineId = rootOrder.find((id) => nodes[id].type === 'line') ?? '';

    store.dispatch(updateNode({ changes: { strokeDash: 20, strokeGap: 20, strokeStyle: 'dashed', strokeWidth: 10 } as never, id: lineId }));
    store.dispatch(setSelection(rootOrder));
    store.dispatch(booleanNodes('union'));
  });
  await designPage.click(1500, 900);

  const blank = await page.screenshot({ clip: { height: 4, width: 4, x: 1100, y: 258 } });

  await expect.poll(async () => (await page.screenshot({ clip: { height: 4, width: 4, x: 868, y: 258 } })).equals(blank)).toBe(false);
  await expect.poll(async () => (await page.screenshot({ clip: { height: 4, width: 4, x: 848, y: 258 } })).equals(blank)).toBe(true);
});

test('a dynamic or brush stroke on a Union is drawn as that stroke, not as a plain ring', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-stroke-modes');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawRectangle(760, 260, 880, 380);

  const setUnionStroke = (changes: Record<string, unknown>): Promise<void> =>
    page.evaluate(async (strokeChanges) => {
      const { store } = await import('/src/store/index.ts');
      const { booleanNodes, setSelection, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const existing = Object.values(pages[activePageId].nodes).find((node) => node.type === 'boolean');

      if (!existing) {
        store.dispatch(setSelection(pages[activePageId].rootOrder));
        store.dispatch(booleanNodes('union'));
      }

      const union = Object.values(store.getState().design.pages[activePageId].nodes).find((node) => node.type === 'boolean');

      store.dispatch(
        updateNode({
          changes: { strokeWidth: 12, strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }], ...strokeChanges } as never,
          id: union?.id ?? '',
        }),
      );
      store.dispatch(setSelection([]));
    }, changes);

  const edgeArea = { height: 120, width: 30, x: 685, y: 200 };

  await setUnionStroke({ strokeMode: 'basic' });
  await designPage.click(1500, 900);
  const plain = await page.screenshot({ clip: edgeArea });

  for (const strokeMode of ['dynamic', 'brush']) {
    await setUnionStroke({ strokeMode });
    await expect.poll(async () => (await page.screenshot({ clip: edgeArea })).equals(plain)).toBe(false);
  }
});

test('a Union of a rectangle and a vector turns as one: the vector bakes the turn into its points and the Union keeps its size and centre', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-rotate-vector');
  await expect(designPage.canvas).toBeVisible();

  // before — a rectangle and a stroked triangle joined in a Union
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, booleanNodes, setSelection } = await import('/src/store/design/slice.ts');

    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
            height: 200,
            id: 'union-rectangle',
            name: 'Rectangle',
            parentId: null,
            rotation: 0,
            type: 'rectangle',
            width: 300,
            x: 800,
            y: 400,
          },
          {
            defaultFill: null,
            filledFaceKeys: [],
            id: 'union-vector',
            name: 'Vector',
            parentId: null,
            rotation: 0,
            segments: {
              s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
              s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
              s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
            },
            strokeWidth: 4,
            strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
            type: 'vector',
            vertexHandleModes: {},
            vertices: { a: { id: 'a', x: 850, y: 250 }, b: { id: 'b', x: 1000, y: 450 }, c: { id: 'c', x: 750, y: 380 } },
          },
        ] as never,
        rootIds: ['union-rectangle', 'union-vector'],
      }),
    );
    store.dispatch(setSelection(['union-rectangle', 'union-vector']));
    store.dispatch(booleanNodes('union' as never));
  });

  const readUnion = async (): Promise<{ centerX: number; centerY: number; height: number; vectorRotation: number; width: number }> =>
    page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const nodes = pages[activePageId].nodes as unknown as Record<
        string,
        { height: number; rotation: number; type: string; width: number }
      >;
      const union = Object.values(nodes).find((node) => node.type === 'boolean')!;

      return {
        centerX: Math.round(union.x + union.width / 2),
        centerY: Math.round(union.y + union.height / 2),
        height: Math.round(union.height),
        vectorRotation: nodes['union-vector'].rotation,
        width: Math.round(union.width),
      };
    });

  const before = await readUnion();

  // action
  const rotation = page.getByRole('textbox', { name: 'Rotation' });

  await rotation.fill('45');
  await rotation.press('Enter');

  // result
  await expect.poll(readUnion).toEqual({ ...before, vectorRotation: 0 });
});

test('a Union holding a vector turned on its own is framed around the drawn vector', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-boolean-rotated-vector-frame');
  await expect(designPage.canvas).toBeVisible();

  // before — a 200x200 square vector turned 45° on its own, joined in a Union with a rectangle to its right
  const frame = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, booleanNodes, setSelection } = await import('/src/store/design/slice.ts');
    const corners = [
      [800, 300],
      [1000, 300],
      [1000, 500],
      [800, 500],
    ];

    store.dispatch(
      addNodes({
        nodes: [
          {
            defaultFill: null,
            filledFaceKeys: [],
            id: 'turned-square',
            name: 'Vector',
            parentId: null,
            rotation: 45,
            segments: Object.fromEntries(
              [0, 1, 2, 3].map((index) => [
                `s${index}`,
                { endId: `v${(index + 1) % 4}`, id: `s${index}`, startId: `v${index}`, tangentEnd: null, tangentStart: null },
              ]),
            ),
            strokeWidth: 2,
            strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
            type: 'vector',
            vertexHandleModes: {},
            vertices: Object.fromEntries(corners.map(([x, y], index) => [`v${index}`, { id: `v${index}`, x, y }])),
          },
          {
            fills: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
            height: 100,
            id: 'side-rectangle',
            name: 'Rectangle',
            parentId: null,
            rotation: 0,
            type: 'rectangle',
            width: 100,
            x: 1200,
            y: 350,
          },
        ] as never,
        rootIds: ['turned-square', 'side-rectangle'],
      }),
    );
    store.dispatch(setSelection(['turned-square', 'side-rectangle']));
    store.dispatch(booleanNodes('union' as never));

    const { activePageId, pages } = store.getState().design;
    const union = Object.values(pages[activePageId].nodes).find((node) => node.type === 'boolean') as unknown as {
      height: number;
      y: number;
    };

    return { height: Math.round(union.height), y: Math.round(union.y) };
  });

  // result — the turned square spans 200·√2 ≈ 283 tall around its centre y = 400
  expect(frame).toEqual({ height: 283, y: 259 });
});
