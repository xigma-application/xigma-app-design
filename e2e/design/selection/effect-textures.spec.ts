import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';

// components
import { DesignPage } from '../model/DesignPage';

const VIEWPORT_OFFSET = { x: 700, y: 120 };
const BACKGROUND = 68;
const SHADOW_DARKNESS = 40;

type TRgb = [number, number, number];

const dropShadow = (color: string, blur: number): unknown[] => [
  { blur, color, opacity: 100, spread: 0, type: 'dropShadow', visible: true, x: 0, y: 30 },
];

const card = (id: string, x: number, effects: unknown[]): Record<string, unknown> => ({
  effects,
  fills: [{ color: '#FFFFFF', opacity: 100, type: 'solid', visible: true }],
  height: 60,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: 'rectangle',
  width: 100,
  x,
  y: 0,
});

const readPixel = async (page: Page, worldX: number, worldY: number): Promise<TRgb> => {
  const png = PNG.sync.read(await page.screenshot());
  const index = ((VIEWPORT_OFFSET.y + worldY) * png.width + VIEWPORT_OFFSET.x + worldX) * 4;

  return [png.data[index], png.data[index + 1], png.data[index + 2]];
};

const dispatchNodes = async (page: Page, nodes: Record<string, unknown>[]): Promise<void> => {
  await page.evaluate(
    async ({ nextNodes, offset }) => {
      const { store } = await import('/src/store/index.ts');
      const slice = await import('/src/store/design/slice.ts');

      store.dispatch(slice.addNodes({ nodes: nextNodes, rootIds: nextNodes.map((node) => node.id as string) }));
      store.dispatch(slice.setViewport({ x: offset.x, y: offset.y, zoom: 1 }));
    },
    { nextNodes: nodes, offset: VIEWPORT_OFFSET },
  );
};

const updateNode = async (page: Page, id: string, changes: Record<string, unknown>): Promise<void> => {
  await page.evaluate(
    async ({ changes: nextChanges, id: nodeId }) => {
      const { store } = await import('/src/store/index.ts');
      const slice = await import('/src/store/design/slice.ts');

      store.dispatch(slice.updateNode({ changes: nextChanges, id: nodeId }));
    },
    { changes, id },
  );
};

const isBackground = (pixel: TRgb): boolean => pixel.every((channel) => Math.abs(channel - BACKGROUND) <= 6);
const isShadow = (pixel: TRgb): boolean => pixel.every((channel) => channel < BACKGROUND - SHADOW_DARKNESS);

test('a drop shadow follows its node when the node moves and disappears from the old place', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-effect-textures-move');
  await expect(designPage.canvas).toBeVisible();

  await dispatchNodes(page, [card('shadowed', 20, dropShadow('#000000', 4))]);

  await expect.poll(async () => isShadow(await readPixel(page, 70, 75))).toBe(true);

  await updateNode(page, 'shadowed', { x: 220 });

  await expect
    .poll(async () => [isShadow(await readPixel(page, 270, 75)), isBackground(await readPixel(page, 70, 75))])
    .toEqual([true, true]);
});

test('editing the shadow color redraws the shadow instead of reusing the previous texture', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-effect-textures-edit');
  await expect(designPage.canvas).toBeVisible();

  await dispatchNodes(page, [card('shadowed', 20, dropShadow('#000000', 4))]);

  await expect.poll(async () => isShadow(await readPixel(page, 70, 75))).toBe(true);

  await updateNode(page, 'shadowed', { effects: dropShadow('#FF0000', 4) });

  await expect
    .poll(async () => {
      const [red, green, blue] = await readPixel(page, 70, 75);

      return red > green + 40 && red > blue + 40;
    })
    .toBe(true);
});

test('two nodes with identical shadows both draw it and only the edited one changes', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-effect-textures-shared');
  await expect(designPage.canvas).toBeVisible();

  await dispatchNodes(page, [card('left', 20, dropShadow('#000000', 4)), card('right', 220, dropShadow('#000000', 4))]);

  await expect.poll(async () => [isShadow(await readPixel(page, 70, 75)), isShadow(await readPixel(page, 270, 75))]).toEqual([true, true]);

  await updateNode(page, 'right', { effects: [] });

  await expect
    .poll(async () => [isShadow(await readPixel(page, 70, 75)), isBackground(await readPixel(page, 270, 75))])
    .toEqual([true, true]);
});

test('a glass effect refreshes when the shape under it changes and keeps its cache when something far away changes', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-effect-textures-glass');
  await expect(designPage.canvas).toBeVisible();

  const glass = await page.evaluate(async () => {
    const { createEffect } = await import('/src/utils/design/effects/createEffect.ts');
    const { EffectType } = await import('/src/types/design/enums.ts');

    return createEffect(EffectType.glass);
  });
  const rect = (
    id: string,
    x: number,
    y: number,
    size: number,
    color: string,
    extra: Record<string, unknown> = {},
  ): Record<string, unknown> => ({
    fills: [{ color, opacity: 100, type: 'solid', visible: true }],
    height: size,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: size,
    x,
    y,
    ...extra,
  });

  await dispatchNodes(page, [
    rect('under', 0, 0, 200, '#FF0000'),
    rect('pane', 60, 60, 80, '#FFFFFF', { effects: [glass], fills: [{ color: '#FFFFFF', opacity: 5, type: 'solid', visible: true }] }),
    rect('far', 600, 300, 20, '#00FF00'),
  ]);

  const isRedder = async (): Promise<boolean> => {
    const [red, , blue] = await readPixel(page, 100, 100);

    return red > blue + 60;
  };
  const isBluer = async (): Promise<boolean> => {
    const [red, , blue] = await readPixel(page, 100, 100);

    return blue > red + 60;
  };

  await expect.poll(isRedder).toBe(true);

  await updateNode(page, 'far', { x: 620 });

  await expect.poll(isRedder).toBe(true);

  await updateNode(page, 'under', { fills: [{ color: '#0000FF', opacity: 100, type: 'solid', visible: true }] });

  await expect.poll(isBluer).toBe(true);
});

test('a background blur refreshes when the shape behind it changes', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-effect-textures-background-blur');
  await expect(designPage.canvas).toBeVisible();

  const blur = { blur: 8, color: '#000000', opacity: 100, spread: 0, type: 'backgroundBlur', visible: true, x: 0, y: 0 };
  const rect = (
    id: string,
    x: number,
    y: number,
    size: number,
    color: string,
    extra: Record<string, unknown> = {},
  ): Record<string, unknown> => ({
    fills: [{ color, opacity: 100, type: 'solid', visible: true }],
    height: size,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: size,
    x,
    y,
    ...extra,
  });

  await dispatchNodes(page, [
    rect('under', 0, 0, 200, '#FF0000'),
    rect('pane', 60, 60, 80, '#FFFFFF', { effects: [blur], fills: [{ color: '#FFFFFF', opacity: 5, type: 'solid', visible: true }] }),
    rect('far', 600, 300, 20, '#00FF00'),
  ]);

  const dominant = async (): Promise<'blue' | 'red' | 'other'> => {
    const [red, , blue] = await readPixel(page, 100, 100);

    if (red > blue + 60) {
      return 'red';
    }

    return blue > red + 60 ? 'blue' : 'other';
  };

  await expect.poll(dominant).toBe('red');

  await updateNode(page, 'far', { x: 620 });

  await expect.poll(dominant).toBe('red');

  await updateNode(page, 'under', { fills: [{ color: '#0000FF', opacity: 100, type: 'solid', visible: true }] });

  await expect.poll(dominant).toBe('blue');
});
