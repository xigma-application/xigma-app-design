import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readPixel = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(await page.screenshot({ clip: { height: 1, width: 1, x, y } }));

  return [png.data[0], png.data[1], png.data[2]];
};

const addSplitImageVector = async (page: Page, rightBlendMode: string): Promise<void> => {
  await page.evaluate(async (rightBlendMode) => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, setSelection } = await import('/src/store/design/slice.ts');
    const { getVectorFillsChange } = await import('/src/utils/canvas/vectorNetwork/getVectorFillsChange.ts');
    const { persistVectorNetworkCrossings } =
      await import('/src/utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings.ts');
    const canvas = document.createElement('canvas');

    canvas.width = 200;
    canvas.height = 100;

    const context = canvas.getContext('2d')!;
    const gradient = context.createLinearGradient(0, 0, 200, 0);

    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1, '#0000ff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 200, 100);

    const point = (id: string, x: number, y: number): { id: string; x: number; y: number } => ({ id, x, y });
    const line = (id: string, startId: string, endId: string): Record<string, unknown> => ({
      endId,
      id,
      startId,
      tangentEnd: null,
      tangentStart: null,
    });
    const network = persistVectorNetworkCrossings(
      {
        b: line('b', 'v2', 'v3'),
        cut: line('cut', 'c1', 'c2'),
        l: line('l', 'v4', 'v1'),
        r: line('r', 'v3', 'v4'),
        t: line('t', 'v1', 'v2'),
      } as never,
      {
        c1: point('c1', 1000, 290),
        c2: point('c2', 1000, 410),
        v1: point('v1', 900, 300),
        v2: point('v2', 1100, 300),
        v3: point('v3', 1100, 400),
        v4: point('v4', 900, 400),
      },
    );
    const vector = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'split-image-vector',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: network.segments,
      strokeWidth: 0,
      strokes: [],
      type: 'vector',
      vertexHandleModes: {},
      vertices: network.vertices,
    };
    const image = { opacity: 100, ref: canvas.toDataURL(), rotation: 0, scaleMode: 'fill', type: 'image' };
    const filled = { ...vector, ...getVectorFillsChange(vector as never, [image] as never) } as typeof vector & {
      fillByKey: Record<string, Record<string, unknown>[]>;
      filledFaceKeys: string[];
    };
    const rightKey = filled.filledFaceKeys.find((key) => !key.includes('l['))!;

    filled.fillByKey = { ...filled.fillByKey, [rightKey]: [{ ...image, blendMode: rightBlendMode }] };
    store.dispatch(addNodes({ nodes: [filled as never], rootIds: [filled.id] }));
    store.dispatch(setSelection([filled.id]));
  }, rightBlendMode);
  await page.waitForTimeout(300);
};

test('a vector split in two areas with one image fill keeps one continuous image and its blend modes while it is resized', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-snapshot-image-fill');
  await expect(designPage.canvas).toBeVisible();

  // before — a 200x100 vector split down the middle, both areas filled with one red-to-blue image, the right one with the Difference blend mode
  await addSplitImageVector(page, 'difference');

  // action — pull the right edge 20px further out and hold it
  await designPage.pointerDown(1100, 350);
  await designPage.pointerMove(1110, 350);
  await designPage.pointerMove(1120, 350);

  // result — both sides of the split carry the same middle of the image, not each its own whole image
  await expect
    .poll(async () => {
      const [leftRed, , leftBlue] = await readPixel(page, 1004, 350);
      const [rightRed, , rightBlue] = await readPixel(page, 1016, 350);

      return Math.abs(leftRed - rightRed) < 60 && Math.abs(leftBlue - rightBlue) < 60;
    })
    .toBe(true);

  // result — the right area keeps its Difference blend mode (the red-to-blue image turns cyan-to-yellow over the light canvas)
  await expect.poll(async () => (await readPixel(page, 1080, 350))[1]).toBeGreaterThan(150);

  await designPage.pointerUp();
});

test('a vector with an image fill carries its image along while it is dragged', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-snapshot-image-drag');
  await expect(designPage.canvas).toBeVisible();

  // before — the same red-to-blue image vector, both areas normal
  await addSplitImageVector(page, 'normal');

  // action — drag it 100px to the right by its middle and hold it
  await designPage.pointerDown(950, 350);
  await designPage.pointerMove(1000, 350);
  await designPage.pointerMove(1050, 350);

  // result — the red start of the image now sits at the moved left edge
  await expect
    .poll(async () => {
      const [red, , blue] = await readPixel(page, 1010, 350);

      return red > blue + 100;
    })
    .toBe(true);

  await designPage.pointerUp();
});

test('a rotated vector turns its image fill with it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-rotated-image-fill');
  await expect(designPage.canvas).toBeVisible();

  // before — the red-to-blue image vector, red on the left
  await addSplitImageVector(page, 'normal');

  const rotation = page.getByRole('textbox', { name: 'Rotation' });

  // action — turn it upside down from the panel
  await rotation.fill('180');
  await rotation.press('Tab');
  await designPage.click(1500, 900);

  // result — the image turned along: blue on the left, red on the right
  await expect
    .poll(async () => {
      const [leftRed, , leftBlue] = await readPixel(page, 910, 350);
      const [rightRed, , rightBlue] = await readPixel(page, 1090, 350);

      return leftBlue > leftRed + 100 && rightRed > rightBlue + 100;
    })
    .toBe(true);
});
