import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';

// components
import { DesignPage } from './model/DesignPage';

const readLastNodeId = (page: Page): Promise<string> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const order = pages[activePageId].rootOrder;

    return order[order.length - 1];
  });

const addNoiseEffect = (page: Page, nodeId: string): Promise<void> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { createEffect } = await import('/src/utils/design/effects/createEffect.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');

    store.dispatch(updateNode({ changes: { effects: [createEffect('noise' as never)] } as never, id }));
  }, nodeId);

const addGlassEffect = (page: Page, nodeId: string): Promise<void> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { createEffect } = await import('/src/utils/design/effects/createEffect.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');

    store.dispatch(updateNode({ changes: { effects: [createEffect('glass' as never)] } as never, id }));
  }, nodeId);

const setFill = (page: Page, nodeId: string, hex: string, opacity = 100): Promise<void> =>
  page.evaluate(
    async ({ nodeId, hex, opacity }) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(updateNode({ changes: { fills: [{ color: hex, opacity, type: 'solid' }] } as never, id: nodeId }));
    },
    { hex, nodeId, opacity },
  );

const reparent = (page: Page, nodeId: string, parentId: string, targetIndex: number): Promise<void> =>
  page.evaluate(
    async ({ nodeId, parentId, targetIndex }) => {
      const { store } = await import('/src/store/index.ts');
      const { moveNodes } = await import('/src/store/design/slice.ts');

      store.dispatch(moveNodes({ nodeIds: [nodeId], targetIndex, targetParentId: parentId } as never));
    },
    { nodeId, parentId, targetIndex },
  );

const selectNode = (page: Page, nodeId: string): Promise<void> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');

    store.dispatch(setSelection([id]));
  }, nodeId);

const downloadToPng = async (download: Awaited<ReturnType<Page['waitForEvent']>>): Promise<PNG> => {
  const stream = await (download as { createReadStream: () => Promise<NodeJS.ReadableStream> }).createReadStream();
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  return PNG.sync.read(Buffer.concat(chunks));
};

const exportSelectedNode = async (page: Page, scale?: '2x'): Promise<PNG> => {
  await page.getByRole('button', { name: 'Add export setting' }).click();

  if (scale) {
    await page.getByText('1x', { exact: true }).click();
    await page.getByText(scale, { exact: true }).click();
  }

  const downloadPromise = page.waitForEvent('download');
  await page
    .getByRole('button', { exact: false, name: /^Export / })
    .last()
    .click();
  const download = await downloadPromise;

  return downloadToPng(download);
};

const exportSelectedNodeAsSvg = async (page: Page): Promise<string> => {
  await page.getByRole('button', { name: 'Add export setting' }).click();
  await page.getByText('PNG', { exact: true }).click();
  await page.getByText('SVG', { exact: true }).click();

  const downloadPromise = page.waitForEvent('download');
  await page
    .getByRole('button', { exact: false, name: /^Export / })
    .last()
    .click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString('utf-8');
};

const readEmbeddedRasterPng = (svg: string): PNG => {
  const match = svg.match(/<image href="data:image\/png;base64,([^"]+)"/);

  if (!match) {
    throw new Error('No embedded raster <image> found in the exported SVG');
  }

  return PNG.sync.read(Buffer.from(match[1], 'base64'));
};

test.describe('Design panels — Export', () => {
  test('a Noise effect on a plain rectangle exports the rectangle content, not the page background', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-export-noise-rect');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 1000, 500);
    const id = await readLastNodeId(page);

    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(updateNode({ changes: { fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] } as never, id: nodeId }));
    }, id);

    await addNoiseEffect(page, id);
    await page.waitForTimeout(300);

    const png = await exportSelectedNode(page);
    const at = (x: number, y: number): { b: number; g: number; r: number } => {
      const offset = (y * png.width + x) * 4;

      return { b: png.data[offset + 2], g: png.data[offset + 1], r: png.data[offset] };
    };

    // result — a green fill with noise on top must still read green-dominant everywhere, never the
    // page's own gray background (#444444, r === g === b) bleeding through from a wrong framebuffer
    const samples = [
      at(5, 5),
      at(png.width - 5, 5),
      at(5, png.height - 5),
      at(png.width - 5, png.height - 5),
      at(Math.floor(png.width / 2), Math.floor(png.height / 2)),
    ];

    for (const sample of samples) {
      expect(sample.g - sample.r).toBeGreaterThan(30);
    }
  });

  test('a Glass effect nested in a frame shows the real backdrop through it when exported at 2x scale', async ({ page }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-export-glass-frame-2x');
    await expect(designPage.canvas).toBeVisible();

    // a red/blue split backdrop inside a frame, with a translucent glass rect straddling the seam
    await designPage.drawFrame(700, 200, 1000, 450);
    const frameId = await readLastNodeId(page);

    await designPage.drawRectangle(700, 200, 850, 450);
    const redId = await readLastNodeId(page);
    await setFill(page, redId, '#ff0000');
    await reparent(page, redId, frameId, 0);

    await designPage.drawRectangle(850, 200, 1000, 450);
    const blueId = await readLastNodeId(page);
    await setFill(page, blueId, '#0000ff');
    await reparent(page, blueId, frameId, 1);

    await designPage.drawRectangle(750, 275, 950, 375);
    const glassId = await readLastNodeId(page);
    await setFill(page, glassId, '#808080', 10);
    await addGlassEffect(page, glassId);
    await reparent(page, glassId, frameId, 2);
    await page.waitForTimeout(300);

    await selectNode(page, frameId);
    await page.waitForTimeout(200);

    const png = await exportSelectedNode(page, '2x');
    const at = (x: number, y: number): { b: number; r: number } => {
      const offset = (y * png.width + x) * 4;

      return { b: png.data[offset + 2], r: png.data[offset] };
    };

    // result — the glass shape (centered in the frame, straddling the red/blue seam) must tint red on
    // its left half and blue on its right half; a flat neutral gray everywhere means it captured the
    // page's own background instead of the real backdrop behind it
    const overRed = at(Math.floor(png.width * 0.35), Math.floor(png.height * 0.5));
    const overBlue = at(Math.floor(png.width * 0.65), Math.floor(png.height * 0.5));

    expect(overRed.r - overRed.b).toBeGreaterThan(20);
    expect(overBlue.b - overBlue.r).toBeGreaterThan(20);
  });

  test('a Glass effect next to a vector-eligible backdrop shows that real backdrop through it in the SVG/PDF raster fallback, not a blank layer', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);
    await designPage.goto('e2e-test-export-glass-svg-raster-layer');
    await expect(designPage.canvas).toBeVisible();

    // a frame containing red/blue backdrop halves (opaque, plain-filled — vector-eligible on their
    // own) with a glass rect on top (raster-ineligible), so the glass rect becomes its own separate
    // raster layer sandwiched between two vector layers within the exported frame's subtree, instead
    // of sharing one subtree walk with them
    await designPage.drawFrame(700, 200, 1000, 400);
    const frameId = await readLastNodeId(page);

    await designPage.drawRectangle(700, 200, 850, 400);
    const redId = await readLastNodeId(page);
    await setFill(page, redId, '#ff0000');
    await reparent(page, redId, frameId, 0);

    await designPage.drawRectangle(850, 200, 1000, 400);
    const blueId = await readLastNodeId(page);
    await setFill(page, blueId, '#0000ff');
    await reparent(page, blueId, frameId, 1);

    await designPage.drawRectangle(750, 250, 950, 350);
    const glassId = await readLastNodeId(page);
    await setFill(page, glassId, '#808080', 10);
    await addGlassEffect(page, glassId);
    await reparent(page, glassId, frameId, 2);
    await page.waitForTimeout(300);

    await selectNode(page, frameId);
    await page.waitForTimeout(200);

    const svg = await exportSelectedNodeAsSvg(page);
    const png = readEmbeddedRasterPng(svg);
    const at = (x: number, y: number): { alpha: number; b: number; r: number } => {
      const offset = (y * png.width + x) * 4;

      return { alpha: png.data[offset + 3], b: png.data[offset + 2], r: png.data[offset] };
    };

    const overRed = at(Math.floor(png.width * 0.25), Math.floor(png.height * 0.5));
    const overBlue = at(Math.floor(png.width * 0.75), Math.floor(png.height * 0.5));

    // result — the raster layer's own render must include the vector-eligible siblings drawn before
    // it in z-order (its "context"), not just its own isolated node, or the glass has nothing real to
    // refract and comes out blank/near-transparent instead of tinted
    expect(overRed.alpha).toBeGreaterThan(200);
    expect(overBlue.alpha).toBeGreaterThan(200);
    expect(overRed.r - overRed.b).toBeGreaterThan(20);
    expect(overBlue.b - overBlue.r).toBeGreaterThan(20);
  });
});
