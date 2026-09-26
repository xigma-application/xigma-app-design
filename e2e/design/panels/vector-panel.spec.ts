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
