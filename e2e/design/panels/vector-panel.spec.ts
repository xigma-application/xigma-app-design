import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(await page.screenshot({ clip: { height: 1, width: 1, x, y } }));

  return [png.data[0], png.data[1], png.data[2]];
};

type TVectorFillState = { fillByKey: Record<string, unknown[]>; filledFaceKeys: string[] };

const readVectorFill = async (page: Page): Promise<TVectorFillState> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const vector = nodes[rootOrder[rootOrder.length - 1]] as unknown as TVectorFillState;

    return { fillByKey: vector.fillByKey ?? {}, filledFaceKeys: vector.filledFaceKeys };
  });

const drawSelectedTriangle = async (designPage: DesignPage, page: Page): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 800, y: 300 },
    { x: 1000, y: 300 },
    { x: 900, y: 450 },
    { x: 800, y: 300 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await designPage.click(900, 300);
};

type TVectorState = { bounds: { height: number; width: number; x: number; y: number }; lockedAspectRatio?: boolean; rotation: number };

const readVector = async (page: Page): Promise<TVectorState> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { getVectorNodeBounds } = await import('/src/utils/canvas/vectorNetwork/getVectorNodeBounds.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const vector = nodes[rootOrder[rootOrder.length - 1]] as Parameters<typeof getVectorNodeBounds>[0] & {
      lockedAspectRatio?: boolean;
      rotation: number;
    };

    return { bounds: getVectorNodeBounds(vector), lockedAspectRatio: vector.lockedAspectRatio, rotation: vector.rotation };
  });

test('a selected vector shows the Vector path panel whose position, size and rotation fields move, resize and turn it', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel');
  await expect(designPage.canvas).toBeVisible();

  // before — a closed 200x150 triangle; leave the pen and vector edit mode, then select it by its top edge
  await designPage.drawVectorPath([
    { x: 800, y: 300 },
    { x: 1000, y: 300 },
    { x: 900, y: 450 },
    { x: 800, y: 300 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await designPage.click(900, 300);

  const header = page.locator('[data-test-component-header="vector"]');
  const width = page.getByRole('spinbutton', { name: 'Width' });
  const x = page.getByRole('spinbutton', { name: 'X position' });
  const rotation = page.getByRole('textbox', { name: 'Rotation' });

  // result
  await expect(header.getByText('Vector path', { exact: true })).toBeVisible();
  await expect(width).toHaveValue('200');

  const before = await readVector(page);

  // action — resize from the width field
  await width.fill('100');
  await width.press('Tab');

  // result — scaled around the top-left of its bounds
  await expect.poll(async () => (await readVector(page)).bounds).toEqual({ ...before.bounds, width: 100 });

  // action — move from the X field
  await x.fill(String(before.bounds.x + 40));
  await x.press('Tab');

  // result
  await expect.poll(async () => (await readVector(page)).bounds.x).toBe(before.bounds.x + 40);

  // action — turn it from the rotation field
  await rotation.fill('30');
  await rotation.press('Tab');

  // result
  await expect.poll(async () => (await readVector(page)).rotation).toBe(30);

  // action — lock the aspect ratio, then change the height
  await page.getByLabel('Lock aspect ratio').click();

  const locked = await readVector(page);
  const height = page.getByRole('spinbutton', { name: 'Height' });

  await height.fill(String(locked.bounds.height * 2));
  await height.press('Tab');

  // result — the width follows
  await expect.poll(async () => (await readVector(page)).bounds.width).toBe(200);
});

test('the vector Fill section fills every area with +, empties them with −, and replaces different area fills from Mixed', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-fill');
  await expect(designPage.canvas).toBeVisible();

  // before
  await drawSelectedTriangle(designPage, page);

  const fillSection = page.locator('[data-test-section="fill"]');
  const background = await readPixelColor(page, 900, 340);

  // action — add a fill to the empty triangle
  await fillSection.getByLabel('Add fill').click();
  await fillSection.getByText('Fill', { exact: true }).click();

  // result — its only area is filled and painted
  await expect.poll(async () => (await readVectorFill(page)).filledFaceKeys).toHaveLength(1);
  await expect.poll(async () => readPixelColor(page, 900, 340)).not.toEqual(background);

  // action — remove the fill
  await fillSection.getByLabel('Delete fill').click();

  // result — no area is filled any more
  await expect.poll(async () => (await readVectorFill(page)).filledFaceKeys).toEqual([]);
  await expect.poll(async () => readPixelColor(page, 900, 340)).toEqual(background);

  // action — give two areas different fills
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    store.dispatch(
      updateNode({
        changes: {
          fillByKey: {
            first: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
            second: [{ color: '#0000ff', opacity: 100, type: 'solid' }],
          },
          filledFaceKeys: ['first', 'second'],
        },
        id: rootOrder[rootOrder.length - 1],
      }),
    );
  });

  // result
  await expect(fillSection.getByText('Click + to replace mixed content')).toBeVisible();

  // action
  await fillSection.getByLabel('Add fill').click();
  await fillSection.getByText('Fill', { exact: true }).click();

  // result — both areas now share one fill
  await expect(fillSection.getByText('Click + to replace mixed content')).toHaveCount(0);

  const { fillByKey } = await readVectorFill(page);

  expect(fillByKey.first).toEqual(fillByKey.second);
});

test('the vector Appearance opacity fades its fill on the canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-opacity');
  await expect(designPage.canvas).toBeVisible();

  // before — a filled triangle
  await drawSelectedTriangle(designPage, page);

  const fillSection = page.locator('[data-test-section="fill"]');
  const background = await readPixelColor(page, 900, 340);

  await fillSection.getByLabel('Add fill').click();
  await fillSection.getByText('Fill', { exact: true }).click();
  await expect.poll(async () => readPixelColor(page, 900, 340)).not.toEqual(background);

  const opaque = await readPixelColor(page, 900, 340);
  const opacity = page.locator('[data-test-section="appearance"]').getByRole('textbox', { name: 'Opacity' });

  // action
  await opacity.fill('50');
  await opacity.press('Tab');

  // result — halfway between the opaque fill and the background
  await expect
    .poll(async () => {
      const [red] = await readPixelColor(page, 900, 340);

      return Math.abs(red - Math.round((opaque[0] + background[0]) / 2)) <= 3;
    })
    .toBe(true);
});

test('a vector stroke with a gradient paint is drawn with the gradient across the vector', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-gradient-stroke');
  await expect(designPage.canvas).toBeVisible();

  // before — a triangle with a thick red-to-blue stroke
  await drawSelectedTriangle(designPage, page);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { rootOrder } = pages[activePageId];

    store.dispatch(
      updateNode({
        changes: {
          strokeWidth: 12,
          strokes: [
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
          ],
        } as never,
        id: rootOrder[rootOrder.length - 1],
      }),
    );
  });
  await designPage.click(1500, 900);

  // result — the top edge is red near its left end and blue near its right end
  await expect
    .poll(async () => {
      const [leftRed, , leftBlue] = await readPixelColor(page, 815, 300);
      const [rightRed, , rightBlue] = await readPixelColor(page, 985, 300);

      return leftRed > leftBlue && rightBlue > rightRed;
    })
    .toBe(true);
});

test('the vector Stroke section sets its weight and position, and Selection colors change an area fill where it comes from', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-stroke');
  await expect(designPage.canvas).toBeVisible();

  // before — a pen triangle with a stroke and one filled area
  await drawSelectedTriangle(designPage, page);

  const fillSection = page.locator('[data-test-section="fill"]');
  const strokeSection = page.locator('[data-test-section="stroke"]');
  const weight = strokeSection.getByLabel('Stroke weight');
  const readStroke = async (): Promise<{ strokeAlign?: string; strokeWidth: number }> =>
    page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const { nodes, rootOrder } = pages[activePageId];

      return nodes[rootOrder[rootOrder.length - 1]] as unknown as { strokeAlign?: string; strokeWidth: number };
    });

  await fillSection.getByLabel('Add fill').click();
  await fillSection.getByText('Fill', { exact: true }).click();

  // action — a thicker stroke
  await weight.fill('10');
  await weight.press('Enter');
  await weight.blur();

  // result
  await expect.poll(async () => (await readStroke()).strokeWidth).toBe(10);

  // action — move the stroke outside
  await strokeSection.locator('[class*="SectionColumn"] [class*="Dropdown"]').first().click();
  await page.locator('[class*="DropdownOption__label"]', { hasText: 'Outside' }).click();

  // result
  await expect.poll(async () => (await readStroke()).strokeAlign).toBe('outside');

  // action — recolor the fill from Selection colors
  const { fillByKey, filledFaceKeys } = await readVectorFill(page);
  const [areaFill] = fillByKey[filledFaceKeys[0]] as { color: string }[];
  const selectionColors = page.locator('[data-test-section="selectionColors"]');
  const hex = selectionColors.getByRole('textbox').first();

  await expect(hex).toHaveValue(areaFill.color.replace('#', '').toUpperCase());
  await hex.fill('00ff00');
  await hex.press('Enter');

  // result — the area now has the new color, painted on the canvas
  await expect
    .poll(async () => {
      const state = await readVectorFill(page);

      return (state.fillByKey[state.filledFaceKeys[0]] as { color: string }[])[0].color.toLowerCase();
    })
    .toBe('#00ff00');
  await expect.poll(async () => readPixelColor(page, 900, 360)).toEqual([0, 255, 0]);
});

test('a vector drop shadow is drawn under its shape and moves with it while dragging', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-effects');
  await expect(designPage.canvas).toBeVisible();

  // before — a filled triangle
  await drawSelectedTriangle(designPage, page);

  const fillSection = page.locator('[data-test-section="fill"]');

  await fillSection.getByLabel('Add fill').click();
  await fillSection.getByText('Fill', { exact: true }).click();

  const background = await readPixelColor(page, 900, 475);

  // action — add a drop shadow from the panel, then make it a hard black one 40px lower
  await page.getByLabel('Add effect').click();
  await page.getByText('Drop shadow', { exact: true }).last().click();
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const id = rootOrder[rootOrder.length - 1];
    const [shadow] = (nodes[id] as unknown as { effects: Record<string, unknown>[] }).effects;

    store.dispatch(
      updateNode({ changes: { effects: [{ ...shadow, blur: 0, color: '#000000', opacity: 100, x: 0, y: 40 }] } as never, id }),
    );
  });
  await designPage.click(1500, 900);

  // result — below the apex, where only the shadow reaches
  await expect.poll(async () => readPixelColor(page, 900, 475)).toEqual([0, 0, 0]);

  // action — drag the triangle 150px to the right by its fill and hold it
  await designPage.pointerDown(900, 340);
  await designPage.pointerMove(975, 340);
  await designPage.pointerMove(1050, 340);

  // result — the shadow went along
  await expect.poll(async () => readPixelColor(page, 1050, 475)).toEqual([0, 0, 0]);
  await expect.poll(async () => readPixelColor(page, 900, 475)).toEqual(background);

  await designPage.pointerUp();
});

test('the vector Corner radius rounds every sharp corner of the vector and keeps its fill', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-corner-radius');
  await expect(designPage.canvas).toBeVisible();

  // before — a filled 200x200 square from the pen, selected by its top edge
  await designPage.drawVectorPath([
    { x: 800, y: 300 },
    { x: 1000, y: 300 },
    { x: 1000, y: 500 },
    { x: 800, y: 500 },
    { x: 800, y: 300 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await designPage.click(900, 300);

  const fillSection = page.locator('[data-test-section="fill"]');

  await fillSection.getByLabel('Add fill').click();
  await fillSection.getByText('Fill', { exact: true }).click();

  const filled = await readPixelColor(page, 900, 400);

  await expect.poll(async () => readPixelColor(page, 805, 305)).toEqual(filled);

  // action
  const cornerRadius = page.getByRole('textbox', { name: 'Corner radius' });

  await cornerRadius.fill('40');
  await cornerRadius.press('Tab');
  await designPage.click(1500, 900);

  // result — every corner is cut away while the middle keeps its fill
  await expect.poll(async () => readPixelColor(page, 805, 305)).not.toEqual(filled);
  await expect.poll(async () => readPixelColor(page, 995, 495)).not.toEqual(filled);
  await expect.poll(async () => readPixelColor(page, 900, 400)).toEqual(filled);
  await expect.poll(async () => readPixelColor(page, 900, 305)).toEqual(filled);
});

test('with two vectors selected, Edit objects in the header menu opens both in vector edit mode', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-edit-objects');
  await expect(designPage.canvas).toBeVisible();

  // before — two vectors, both selected
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, setSelection } = await import('/src/store/design/slice.ts');
    const square = (id: string, x: number): Record<string, unknown> => ({
      defaultFill: null,
      filledFaceKeys: [],
      id,
      name: id,
      parentId: null,
      rotation: 0,
      segments: {
        [`${id}-a`]: { endId: `${id}-2`, id: `${id}-a`, startId: `${id}-1`, tangentEnd: null, tangentStart: null },
        [`${id}-b`]: { endId: `${id}-3`, id: `${id}-b`, startId: `${id}-2`, tangentEnd: null, tangentStart: null },
      },
      strokeWidth: 1,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
      type: 'vector',
      vertexHandleModes: {},
      vertices: {
        [`${id}-1`]: { id: `${id}-1`, x, y: 300 },
        [`${id}-2`]: { id: `${id}-2`, x: x + 100, y: 300 },
        [`${id}-3`]: { id: `${id}-3`, x: x + 100, y: 400 },
      },
    });

    store.dispatch(addNodes({ nodes: [square('edit-a', 800), square('edit-b', 1000)] as never, rootIds: ['edit-a', 'edit-b'] }));
    store.dispatch(setSelection(['edit-a', 'edit-b']));
  });

  // action
  await page.locator('[data-test-component-header="vector"]').getByLabel('More actions').click();
  await page.getByText('Edit objects', { exact: true }).click();

  // result
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const { store } = await import('/src/store/index.ts');

        return [...store.getState().design.vectorEditingNodeIds].sort();
      }),
    )
    .toEqual(['edit-a', 'edit-b']);
});

test('a vector in vector edit mode shows the Vector edit panel with Alignment, Position, Mirroring, Corner radius, Fill and Stroke, and leaving it brings back the Vector path panel', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-edit-mode');
  await expect(designPage.canvas).toBeVisible();

  // before — a selected triangle outside of vector edit mode
  await drawSelectedTriangle(designPage, page);
  await expect(page.getByText('Vector path', { exact: true })).toBeVisible();

  // action
  await page.locator('[data-test-component-header="vector"]').getByLabel('Edit object').click();

  // result — the Vector section with nothing selected, then only Fill and Stroke
  const vectorEdit = page.locator('[data-test-section="vector-edit"]');

  await expect(vectorEdit.getByText('Vector', { exact: true })).toBeVisible();
  await expect(vectorEdit.getByText('Mirroring', { exact: true })).toBeVisible();
  await expect(vectorEdit.getByRole('button', { name: 'Mirror angle and length' })).toBeDisabled();
  await expect(vectorEdit.getByRole('textbox', { name: 'X position' })).toHaveValue('');
  await expect(vectorEdit.getByRole('textbox', { name: 'Corner radius' })).toBeEnabled();
  await expect(page.locator('[data-test-section="fill"]')).toBeVisible();
  await expect(page.locator('[data-test-section="stroke"]')).toBeVisible();
  await expect(page.locator('[data-test-section="effects"]')).toHaveCount(0);
  await expect(page.getByText('Vector path', { exact: true })).toHaveCount(0);

  // action
  await page.keyboard.press('Escape');

  // result
  await expect(page.getByText('Vector path', { exact: true })).toBeVisible();
  await expect(vectorEdit).toHaveCount(0);
});

type TEditedVector = {
  cornerRadius?: number;
  cornerRadiusByVertexId?: Record<string, number>;
  vertexHandleModes: Record<string, string>;
  vertices: Record<string, { id: string; x: number; y: number }>;
};

const readEditedVector = async (page: Page): Promise<TEditedVector> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages, vectorEditingNodeIds } = store.getState().design;

    return pages[activePageId].nodes[vectorEditingNodeIds[0]] as unknown as TEditedVector;
  });

test('a point selected on the canvas in vector edit mode shows its position, mirroring and own corner radius in the panel, and each one edits only that point', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-edit-point');
  await expect(designPage.canvas).toBeVisible();

  // before — a 200x200 square from the pen, opened in vector edit mode
  await designPage.drawVectorPath([
    { x: 800, y: 300 },
    { x: 1000, y: 300 },
    { x: 1000, y: 500 },
    { x: 800, y: 500 },
    { x: 800, y: 300 },
  ]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await designPage.click(900, 300);
  await page.locator('[data-test-component-header="vector"]').getByLabel('Edit object').click();

  const vectorEdit = page.locator('[data-test-section="vector-edit"]');
  const x = vectorEdit.getByLabel('X position');

  await expect(x).toHaveValue('');

  // action — select the top right point
  await designPage.click(1000, 300);

  // result
  const before = await readEditedVector(page);
  const [pointId, point] = Object.entries(before.vertices).reduce((best, entry) =>
    entry[1].x - entry[1].y > best[1].x - best[1].y ? entry : best,
  );

  await expect(x).toHaveValue(String(point.x));
  await expect(vectorEdit.getByLabel('Y position')).toHaveValue(String(point.y));
  await expect(vectorEdit.getByRole('button', { name: 'Mirror angle and length' })).toBeEnabled();

  // action — move it by X
  await x.fill(String(point.x + 50));
  await x.press('Tab');

  // result — only that point moved
  await expect.poll(async () => (await readEditedVector(page)).vertices[pointId].x).toBe(point.x + 50);

  const moved = await readEditedVector(page);

  Object.entries(before.vertices)
    .filter(([id]) => id !== pointId)
    .forEach(([id, vertex]) => expect(moved.vertices[id]).toEqual(vertex));

  // action — mirroring and corner radius of that point
  await vectorEdit.getByRole('button', { name: 'Mirror angle and length' }).click();

  const cornerRadius = vectorEdit.getByLabel('Corner radius');

  await cornerRadius.fill('30');
  await cornerRadius.press('Tab');

  // result
  await expect.poll(async () => (await readEditedVector(page)).vertexHandleModes[pointId]).toBe('symmetric');
  await expect.poll(async () => (await readEditedVector(page)).cornerRadiusByVertexId).toEqual({ [pointId]: 30 });
  expect((await readEditedVector(page)).cornerRadius).toBeUndefined();
});

test('with points from two pieces of a vector selected, Align left moves each piece as a whole to the left edge', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-edit-align');
  await expect(designPage.canvas).toBeVisible();

  // before — one vector made of two squares, open in vector edit mode
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, setSelection, setVectorEditingNodeIds } = await import('/src/store/design/slice.ts');
    const corners = (prefix: string, x: number, y: number): [string, { id: string; x: number; y: number }][] =>
      [
        [0, 0],
        [100, 0],
        [100, 100],
        [0, 100],
      ].map(([dx, dy], index) => [`${prefix}${index}`, { id: `${prefix}${index}`, x: x + dx, y: y + dy }]);
    const sides = (prefix: string): [string, Record<string, unknown>][] =>
      [0, 1, 2, 3].map((index) => [
        `${prefix}s${index}`,
        { endId: `${prefix}${(index + 1) % 4}`, id: `${prefix}s${index}`, startId: `${prefix}${index}`, tangentEnd: null, tangentStart: null },
      ]);

    store.dispatch(
      addNodes({
        nodes: [
          {
            defaultFill: null,
            filledFaceKeys: [],
            id: 'two-pieces',
            name: 'Two pieces',
            parentId: null,
            rotation: 0,
            segments: Object.fromEntries([...sides('a'), ...sides('b')]),
            strokeWidth: 1,
            strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
            type: 'vector',
            vertexHandleModes: {},
            vertices: Object.fromEntries([...corners('a', 800, 300), ...corners('b', 1000, 450)]),
          },
        ] as never,
        rootIds: ['two-pieces'],
      }),
    );
    store.dispatch(setSelection(['two-pieces']));
    store.dispatch(setVectorEditingNodeIds(['two-pieces']));
  });

  const alignLeft = page.locator('[data-test-section="vector-edit"]').getByRole('button', { name: 'Align left' });

  await expect(alignLeft).toBeDisabled();

  // action — select every point, then align them left
  await designPage.canvas.hover();
  await page.keyboard.press('Control+a');
  await expect(alignLeft).toBeEnabled();
  await alignLeft.click();

  // result — the second square keeps its shape and starts at the left edge of the first
  await expect
    .poll(async () => {
      const { vertices } = await readEditedVector(page);

      return [vertices.b0, vertices.b2, vertices.a0];
    })
    .toEqual([
      { id: 'b0', x: 800, y: 450 },
      { id: 'b2', x: 900, y: 550 },
      { id: 'a0', x: 800, y: 300 },
    ]);
});

test('a handle selected on the canvas in vector edit mode shows and moves its end in the panel, and Corner radius sets the radius of its point', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-panel-edit-handle');
  await expect(designPage.canvas).toBeVisible();

  // before — one curve whose first point has a handle ending at (860, 220), open in vector edit mode
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, setSelection, setVectorEditingNodeIds } = await import('/src/store/design/slice.ts');

    store.dispatch(
      addNodes({
        nodes: [
          {
            defaultFill: null,
            filledFaceKeys: [],
            id: 'curve',
            name: 'Curve',
            parentId: null,
            rotation: 0,
            segments: { s: { endId: 'b', id: 's', startId: 'a', tangentEnd: { x: -60, y: -80 }, tangentStart: { x: 60, y: -80 } } },
            strokeWidth: 1,
            strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
            type: 'vector',
            vertexHandleModes: {},
            vertices: { a: { id: 'a', x: 800, y: 300 }, b: { id: 'b', x: 1000, y: 300 } },
          },
        ] as never,
        rootIds: ['curve'],
      }),
    );
    store.dispatch(setSelection(['curve']));
    store.dispatch(setVectorEditingNodeIds(['curve']));
  });

  const vectorEdit = page.locator('[data-test-section="vector-edit"]');
  const x = vectorEdit.getByLabel('X position');

  // action — select the first point, then its handle
  await designPage.click(800, 300);
  await expect(x).toHaveValue('800');
  await designPage.click(860, 220);

  // result — the panel shows the end of the handle
  await expect(x).toHaveValue('860');
  await expect(vectorEdit.getByLabel('Y position')).toHaveValue('220');

  // action
  await x.fill('880');
  await x.press('Tab');

  const cornerRadius = vectorEdit.getByLabel('Corner radius');

  await cornerRadius.fill('12');
  await cornerRadius.press('Tab');

  // result
  await expect
    .poll(async () => {
      const vector = await readEditedVector(page);

      return {
        radius: vector.cornerRadiusByVertexId,
        tangent: (vector as unknown as { segments: Record<string, { tangentStart: unknown }> }).segments.s.tangentStart,
      };
    })
    .toEqual({ radius: { a: 12 }, tangent: { x: 80, y: -80 } });
});
