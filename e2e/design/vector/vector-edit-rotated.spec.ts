import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readPixel = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(await page.screenshot({ clip: { height: 1, width: 1, x, y } }));

  return [png.data[0], png.data[1], png.data[2]];
};

// a 200x200 square around (900, 400) turned 30deg, optionally filled with a red-to-blue image, opened in vector edit mode
const openRotatedSquare = async (page: Page, withImage: boolean): Promise<void> => {
  await page.evaluate(async (hasImage) => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, setSelection } = await import('/src/store/design/slice.ts');
    const { getVectorFillsChange } = await import('/src/utils/canvas/vectorNetwork/getVectorFillsChange.ts');
    const segment = (id: string, startId: string, endId: string): Record<string, unknown> => ({
      endId,
      id,
      startId,
      tangentEnd: null,
      tangentStart: null,
    });
    const node = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'rotated',
      name: 'Vector',
      parentId: null,
      rotation: 30,
      segments: { s1: segment('s1', 'a', 'b'), s2: segment('s2', 'b', 'c'), s3: segment('s3', 'c', 'd'), s4: segment('s4', 'd', 'a') },
      strokeWidth: 2,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
      type: 'vector',
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 800, y: 300 },
        b: { id: 'b', x: 1000, y: 300 },
        c: { id: 'c', x: 1000, y: 500 },
        d: { id: 'd', x: 800, y: 500 },
      },
    };
    const canvas = document.createElement('canvas');

    canvas.width = 200;
    canvas.height = 200;

    const context = canvas.getContext('2d')!;
    const gradient = context.createLinearGradient(0, 0, 200, 0);

    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1, '#0000ff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 200, 200);

    const image = { opacity: 100, ref: canvas.toDataURL(), rotation: 0, scaleMode: 'fill', type: 'image' };
    const vector = hasImage ? { ...node, ...getVectorFillsChange(node as never, [image] as never) } : node;

    store.dispatch(addNodes({ nodes: [vector as never], rootIds: ['rotated'] }));
    store.dispatch(setSelection(['rotated']));
  }, withImage);
  await page.mouse.move(1300, 800);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
};

type TNodeSummary = { fillRotation?: number; rotation: number; vertexCount: number };

const readNodes = (page: Page): Promise<TNodeSummary[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return rootOrder.map((id) => {
      const node = nodes[id] as unknown as { fillRotation?: number; rotation: number; vertices: Record<string, unknown> };

      return { fillRotation: node.fillRotation, rotation: node.rotation, vertexCount: Object.keys(node.vertices).length };
    });
  });

test('a rotated vector with an image keeps its image turned in vector edit mode, also after the first click', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-rotated-image');
  await expect(designPage.canvas).toBeVisible();

  // before — the turned square in edit mode: its points already carry the turn, the image keeps it
  await openRotatedSquare(page, true);

  expect(await readNodes(page)).toEqual([{ fillRotation: 30, rotation: 0, vertexCount: 4 }]);

  const leftCorner = await readPixel(page, 775, 432);

  // action — the first click in edit mode
  await designPage.click(1250, 700);

  // result — the red start of the image is still along the turned left edge
  expect(leftCorner[0]).toBeGreaterThan(leftCorner[2] + 100);
  await expect.poll(async () => readPixel(page, 775, 432)).toEqual(leftCorner);
});

test('the lasso picks a point of a rotated vector where it is drawn', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-rotated-lasso');
  await expect(designPage.canvas).toBeVisible();

  // before
  await openRotatedSquare(page, false);
  await page.getByRole('button', { name: /Lasso/ }).click();

  // action — loop around the turned top corner (863, 263), then delete what got picked
  await designPage.dragVectorLasso([
    { x: 840, y: 240 },
    { x: 890, y: 240 },
    { x: 890, y: 290 },
    { x: 840, y: 290 },
    { x: 840, y: 240 },
  ]);
  await page.keyboard.press('Delete');

  // result
  await expect.poll(async () => (await readNodes(page))[0].vertexCount).toBe(3);
});

test('cutting a rotated vector with an image gives both pieces the turned image covering all of them', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-edit-rotated-cut');
  await expect(designPage.canvas).toBeVisible();

  // before
  await openRotatedSquare(page, true);
  await page.getByRole('button', { name: /Wytnij|Cut/ }).click();

  // action — cut straight across the middle
  await designPage.pointerDown(700, 400);
  await designPage.pointerMove(900, 400);
  await designPage.pointerMove(1100, 400);
  await designPage.pointerUp();

  // result — two pieces, both keeping the turn for their image, and the top piece is painted right up to its left edge
  await expect.poll(async () => (await readNodes(page)).map(({ fillRotation }) => fillRotation)).toEqual([30, 30]);

  const [red, green, blue] = await readPixel(page, 806, 380);

  expect(red).toBeGreaterThan(green + 100);
  expect(red).toBeGreaterThan(blue);
});
