import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';

// components
import { DesignPage } from '../model/DesignPage';

const VIEWPORT_OFFSET = { x: 600, y: 80 };
const COLUMNS = 70;
const PITCH = 14;
const SIZE = 10;

type TRgb = [number, number, number];

const RED: TRgb = [255, 0, 0];
const GREEN: TRgb = [0, 255, 0];
const BLUE: TRgb = [0, 0, 255];

const solid = (color: string): unknown[] => [{ color, opacity: 100, type: 'solid', visible: true }];

const rectangle = (id: string, x: number, y: number, color: string, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  fills: solid(color),
  height: SIZE,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: 'rectangle',
  width: SIZE,
  x,
  y,
  ...extra,
});

const addNodes = async (page: Page, nodes: Record<string, unknown>[], rootIds: string[]): Promise<void> => {
  await page.evaluate(
    async ({ nodes: nextNodes, offset, rootIds: nextRootIds }) => {
      const { store } = await import('/src/store/index.ts');
      const slice = await import('/src/store/design/slice.ts');

      store.dispatch(slice.addNodes({ nodes: nextNodes, rootIds: nextRootIds }));
      store.dispatch(slice.setViewport({ x: offset.x, y: offset.y, zoom: 1 }));
    },
    { nodes, offset: VIEWPORT_OFFSET, rootIds },
  );
};

const readPixels = async (page: Page, points: { x: number; y: number }[]): Promise<TRgb[]> => {
  const png = PNG.sync.read(await page.screenshot());

  return points.map(({ x, y }) => {
    const index = (y * png.width + x) * 4;

    return [png.data[index], png.data[index + 1], png.data[index + 2]];
  });
};

const toPage = (worldX: number, worldY: number): { x: number; y: number } => ({
  x: VIEWPORT_OFFSET.x + worldX,
  y: VIEWPORT_OFFSET.y + worldY,
});

const isColor = (pixel: TRgb, expected: TRgb): boolean => pixel.every((channel, index) => Math.abs(channel - expected[index]) <= 6);

const centerOf = (index: number): { x: number; y: number } =>
  toPage((index % COLUMNS) * PITCH + SIZE / 2, Math.floor(index / COLUMNS) * PITCH + SIZE / 2);

test('thousands of plain rectangles render with the right colors on both sides of a chunk boundary', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rect-batching-chunks');
  await expect(designPage.canvas).toBeVisible();

  const count = 700;
  const nodes = Array.from({ length: count }, (_, index) => {
    const color = index === 511 ? '#00FF00' : index === 512 ? '#0000FF' : '#FF0000';

    return rectangle(`r${index}`, (index % COLUMNS) * PITCH, Math.floor(index / COLUMNS) * PITCH, color);
  });

  await addNodes(
    page,
    nodes,
    nodes.map((node) => node.id as string),
  );

  const sampled = [centerOf(0), centerOf(510), centerOf(511), centerOf(512), centerOf(699)];
  const gap = { x: centerOf(0).x + PITCH / 2 + 1, y: centerOf(0).y };

  await expect
    .poll(async () => {
      const pixels = await readPixels(page, [...sampled, gap]);

      return [
        isColor(pixels[0], RED),
        isColor(pixels[1], RED),
        isColor(pixels[2], GREEN),
        isColor(pixels[3], BLUE),
        isColor(pixels[4], RED),
        isColor(pixels[5], RED),
      ];
    })
    .toEqual([true, true, true, true, true, false]);
});

test('a rectangle inside a clipping frame is cut off at the frame edge', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rect-batching-clip');
  await expect(designPage.canvas).toBeVisible();

  const frame = {
    childIds: ['clipped'],
    clipContent: true,
    fills: solid('#222222'),
    height: 100,
    id: 'frame',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: 'frame',
    width: 100,
    x: 100,
    y: 100,
  };
  const child = rectangle('clipped', 170, 140, '#FF0000', { height: 20, parentId: 'frame', width: 60 });

  await addNodes(page, [frame, child], ['frame']);

  const inside = toPage(185, 150);
  const outside = toPage(215, 150);

  await expect
    .poll(async () => {
      const [insidePixel, outsidePixel] = await readPixels(page, [inside, outside]);

      return [isColor(insidePixel, RED), isColor(outsidePixel, RED)];
    })
    .toEqual([true, false]);
});

test('editing one rectangle of a batched run updates it without disturbing its neighbours', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rect-batching-edit');
  await expect(designPage.canvas).toBeVisible();

  const nodes = Array.from({ length: 5 }, (_, index) => rectangle(`e${index}`, index * PITCH, 0, '#FF0000'));

  await addNodes(
    page,
    nodes,
    nodes.map((node) => node.id as string),
  );

  await expect.poll(async () => isColor((await readPixels(page, [centerOf(2)]))[0], RED)).toBe(true);

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const slice = await import('/src/store/design/slice.ts');

    store.dispatch(slice.updateNode({ changes: { fills: [{ color: '#00FF00', opacity: 100, type: 'solid', visible: true }] }, id: 'e2' }));
  });

  await expect
    .poll(async () => {
      const pixels = await readPixels(page, [centerOf(1), centerOf(2), centerOf(3)]);

      return pixels.map((pixel, index) => isColor(pixel, index === 1 ? GREEN : RED));
    })
    .toEqual([true, true, true]);
});

const REGULAR_PATH_MARKER = { effects: [{ blur: 0, color: '#000000', opacity: 0, spread: 0, type: 'noise', visible: false, x: 0, y: 0 }] };
const TWIN_OFFSET = 90;
const TWIN_COMPARE_MARGIN = 6;

const readPng = async (page: Page): Promise<PNG> => PNG.sync.read(await page.screenshot());

const getMaxChannelDiff = (
  png: PNG,
  left: { x: number; y: number },
  right: { x: number; y: number },
  width: number,
  height: number,
): number => {
  let worst = 0;

  for (let dx = -TWIN_COMPARE_MARGIN; dx < width + TWIN_COMPARE_MARGIN; dx += 1) {
    for (let dy = -TWIN_COMPARE_MARGIN; dy < height + TWIN_COMPARE_MARGIN; dy += 1) {
      const leftIndex = ((left.y + dy) * png.width + left.x + dx) * 4;
      const rightIndex = ((right.y + dy) * png.width + right.x + dx) * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        worst = Math.max(worst, Math.abs(png.data[leftIndex + channel] - png.data[rightIndex + channel]));
      }
    }
  }

  return worst;
};

const backdrop = (width: number, height: number): Record<string, unknown> => rectangle('backdrop', -20, -20, '#8E8E93', { height, width });

test('a batched rectangle is pixel-identical to the same rectangle drawn through the regular path', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rect-batching-twin');
  await expect(designPage.canvas).toBeVisible();

  const variants: { extra: Record<string, unknown>; fills: unknown[] }[] = [
    { extra: {}, fills: solid('#FF3B30') },
    { extra: {}, fills: [{ color: '#FF3B30', opacity: 40, type: 'solid', visible: true }] },
    { extra: { opacity: 0.5 }, fills: solid('#0A84FF') },
    { extra: { rotation: 30 }, fills: solid('#34C759') },
    { extra: { cornerRadius: 12 }, fills: solid('#FF9F0A') },
    { extra: { cornerRadius: 20, rotation: 20 }, fills: [{ color: '#BF5AF2', opacity: 60, type: 'solid', visible: true }] },
    { extra: { cornerRadiusBottomRight: 16, cornerRadiusTopLeft: 4, opacity: 0.7 }, fills: solid('#64D2FF') },
    { extra: { strokeAlign: 'inside', strokeWidth: 4, strokes: solid('#000000') }, fills: solid('#FF9F0A') },
    { extra: { strokeAlign: 'center', strokeWidth: 4, strokes: solid('#FFFFFF') }, fills: solid('#30D158') },
    { extra: { strokeAlign: 'outside', strokeWidth: 4, strokes: solid('#0A84FF') }, fills: solid('#FF453A') },
    { extra: { cornerRadius: 14, strokeAlign: 'outside', strokeWidth: 5, strokes: solid('#000000') }, fills: solid('#FFD60A') },
    { extra: { rotation: 25, strokeAlign: 'center', strokeWidth: 4, strokes: solid('#000000') }, fills: solid('#BF5AF2') },
    {
      extra: {
        opacity: 0.6,
        strokeAlign: 'inside',
        strokeWidth: 6,
        strokes: [{ color: '#FFFFFF', opacity: 50, type: 'solid', visible: true }],
      },
      fills: solid('#0A84FF'),
    },
    {
      extra: {
        strokeAlign: 'center',
        strokeWidth: 4,
        strokes: [
          { color: '#FF0000', opacity: 100, type: 'solid', visible: true },
          { color: '#00FF00', opacity: 60, type: 'solid', visible: true },
        ],
      },
      fills: solid('#5E5CE6'),
    },
    {
      extra: {},
      fills: [
        { color: '#FF3B30', opacity: 100, type: 'solid', visible: true },
        { color: '#0A84FF', opacity: 50, type: 'solid', visible: true },
      ],
    },
    {
      extra: {},
      fills: [
        { color: '#FF3B30', opacity: 50, type: 'solid', visible: true },
        { color: '#0A84FF', opacity: 100, type: 'solid', visible: true },
      ],
    },
    {
      extra: {},
      fills: [
        { color: '#FF3B30', opacity: 100, type: 'solid', visible: true },
        { color: '#0A84FF', opacity: 100, type: 'solid', visible: false },
      ],
    },
  ];
  const pitch = 50;
  const nodes: Record<string, unknown>[] = [backdrop(TWIN_OFFSET + 100, variants.length * pitch + 40)];

  variants.forEach((variant, index) => {
    const shape = { height: 40, width: 60, ...variant.extra, fills: variant.fills };

    nodes.push(rectangle(`plain${index}`, 0, index * pitch, '#000000', shape));
    nodes.push(rectangle(`twin${index}`, TWIN_OFFSET, index * pitch, '#000000', { ...shape, ...REGULAR_PATH_MARKER }));
  });

  await addNodes(
    page,
    nodes,
    nodes.map((node) => node.id as string),
  );

  await expect
    .poll(async () => {
      const png = await readPng(page);

      return variants.map((_, index) => getMaxChannelDiff(png, toPage(0, index * pitch), toPage(TWIN_OFFSET, index * pitch), 60, 40));
    })
    .toEqual(variants.map(() => 0));
});

test('rectangles inside a mask and inside a clipping frame with opacity match the regular path', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rect-batching-container-twin');
  await expect(designPage.canvas).toBeVisible();

  const buildScene = (prefix: string, dx: number, twin: boolean): Record<string, unknown>[] => {
    const extra = twin ? REGULAR_PATH_MARKER : {};

    return [
      {
        childIds: [`${prefix}shape`, `${prefix}fill`],
        height: 60,
        id: `${prefix}mask`,
        name: 'mask',
        parentId: null,
        rotation: 0,
        type: 'mask',
        width: 100,
        x: dx,
        y: 0,
      },
      {
        fill: '#FFFFFF',
        height: 50,
        id: `${prefix}shape`,
        name: 'shape',
        parentId: `${prefix}mask`,
        rotation: 0,
        type: 'ellipse',
        width: 50,
        x: dx + 10,
        y: 5,
      },
      rectangle(`${prefix}fill`, dx, 0, '#0A84FF', { height: 60, parentId: `${prefix}mask`, width: 100, ...extra }),
      {
        childIds: [`${prefix}c1`, `${prefix}c2`],
        clipContent: true,
        fills: solid('#222222'),
        height: 60,
        id: `${prefix}frame`,
        name: 'frame',
        opacity: 0.6,
        parentId: null,
        rotation: 0,
        type: 'frame',
        width: 100,
        x: dx,
        y: 80,
      },
      rectangle(`${prefix}c1`, dx + 20, 90, '#34C759', { height: 20, parentId: `${prefix}frame`, width: 100, ...extra }),
      rectangle(`${prefix}c2`, dx + 10, 100, '#FFD60A', {
        fills: [{ color: '#FFD60A', opacity: 50, type: 'solid', visible: true }],
        height: 60,
        parentId: `${prefix}frame`,
        width: 40,
        ...extra,
      }),
    ];
  };
  const nodes = [backdrop(340, 220), ...buildScene('plain', 0, false), ...buildScene('twin', 160, true)];
  const rootIds = ['backdrop', 'plainmask', 'plainframe', 'twinmask', 'twinframe'];

  await addNodes(page, nodes, rootIds);

  await expect
    .poll(async () => {
      const png = await readPng(page);

      return [
        getMaxChannelDiff(png, toPage(0, 0), toPage(160, 0), 100, 60),
        getMaxChannelDiff(png, toPage(0, 80), toPage(160, 80), 100, 60),
      ];
    })
    .toEqual([0, 0]);
});

test('batched ellipses keep their shape, opacity and rotation', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-rect-batching-ellipses');
  await expect(designPage.canvas).toBeVisible();

  const ellipse = (id: string, y: number, extra: Record<string, unknown>): Record<string, unknown> => ({
    fill: '#FF3B30',
    height: 40,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: 'ellipse',
    width: 60,
    x: 20,
    y,
    ...extra,
  });
  const nodes = [
    backdrop(200, 260),
    ellipse('full', 0, {}),
    ellipse('half', 60, { opacity: 0.5 }),
    ellipse('turned', 120, { height: 20, rotation: 90, width: 70, x: 15, y: 140 }),
  ];

  await addNodes(
    page,
    nodes,
    nodes.map((node) => node.id as string),
  );

  const FILL: TRgb = [255, 59, 48];
  const HALF: TRgb = [198, 100, 97];
  const BACKGROUND: TRgb = [142, 142, 147];

  await expect
    .poll(async () => {
      const pixels = await readPixels(page, [
        toPage(50, 20),
        toPage(21, 1),
        toPage(50, 80),
        toPage(50, 150),
        toPage(50, 178),
        toPage(80, 150),
      ]);

      return [
        isColor(pixels[0], FILL),
        isColor(pixels[1], BACKGROUND),
        isColor(pixels[2], HALF),
        isColor(pixels[3], FILL),
        isColor(pixels[4], FILL),
        isColor(pixels[5], BACKGROUND),
      ];
    })
    .toEqual([true, true, true, true, true, true]);
});
