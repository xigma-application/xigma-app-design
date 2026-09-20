import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadableEffect = {
  blur: number;
  end?: { x: number; y: number };
  start?: { x: number; y: number };
  color: string;
  opacity: number;
  spread: number;
  type: string;
  visible?: boolean;
  x: number;
  y: number;
};
type TReadableNode = { effects?: TReadableEffect[] };

const readFirstNodeId = (page: Page): Promise<string> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].rootOrder[0];
  });

const readNode = (page: Page, id: string): Promise<TReadableNode> =>
  page.evaluate(async (nodeId) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes[nodeId] as TReadableNode;
  }, id);

const addEffect = async (page: Page, label: string): Promise<void> => {
  await page.getByLabel('Add effect').click();
  await page.getByText(label, { exact: true }).last().click();
};

test.describe('Design panels — Effects section', () => {
  test('adding an inner shadow shows a row that opens a 240px settings panel whose values are saved on the node', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-section');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // action
    await addEffect(page, 'Inner shadow');

    // result
    expect((await readNode(page, id)).effects).toEqual([
      { blendMode: 'normal', blur: 4, color: '#000000', opacity: 25, spread: 0, type: 'innerShadow', x: 0, y: 4 },
    ]);

    const row = page.locator('[class*="EffectRow__trigger"]');

    await expect(row).toBeVisible();

    // result — choosing the effect opens its panel and highlights the row
    await expect(row).toHaveClass(/EffectRow__trigger--active/);

    const panel = page.locator('[class*="EffectSettingsPanel_"]').first();

    expect((await panel.boundingBox())?.width).toBe(240);
    await expect(page.getByLabel('Effect X offset')).toHaveValue('0');
    await expect(page.getByLabel('Effect Y offset')).toHaveValue('4');
    await expect(page.getByLabel('Effect blur')).toHaveValue('4');
    await expect(page.getByLabel('Effect spread')).toHaveValue('0');
    await expect(page.getByLabel('Effect color').locator('..').getByRole('textbox').first()).toHaveValue('000000');
    await expect(panel.getByText('Position')).toHaveCount(1);
    expect((await panel.locator('[class*="EffectSettingsField_"]').first().boundingBox())?.height).toBe(32);
    expect((await panel.locator('[class*="EffectSettingsField__control"]').first().boundingBox())?.width).toBe(136);

    // action
    await page.getByLabel('Effect Y offset').fill('8');
    await page.getByLabel('Effect Y offset').press('Enter');
    await page.getByLabel('Effect blur').fill('-3');
    await page.getByLabel('Effect blur').press('Enter');

    // result
    expect((await readNode(page, id)).effects?.[0]).toMatchObject({ blur: 0, y: 8 });

    // action: dragging the X label scrubs its value
    const xLabel = page.locator('[class*="EffectSettingsPanel_"]').getByText('X', { exact: true });
    const xBox = (await xLabel.boundingBox())!;

    await page.mouse.move(xBox.x + xBox.width / 2, xBox.y + xBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(xBox.x + xBox.width / 2 + 30, xBox.y + xBox.height / 2, { steps: 6 });
    await page.mouse.up();

    // result
    await expect.poll(async () => (await readNode(page, id)).effects?.[0].x).toBeGreaterThan(0);

    // action: arrow keys step the number
    await page.getByLabel('Effect spread').focus();
    await page.keyboard.press('ArrowUp');

    // result
    await expect(page.getByLabel('Effect spread')).toHaveValue('1');

    // action: the header droplet sets the blend mode
    await page.getByLabel('Apply blend mode to effect').click();
    await page.getByText('Multiply', { exact: true }).click();

    // result
    expect((await readNode(page, id)).effects?.[0].blendMode).toBe('multiply');

    // action: the header menu changes the effect type
    await page.getByLabel('Change effect type').click();
    await page.getByText('Drop shadow', { exact: true }).last().click();

    // result
    expect((await readNode(page, id)).effects?.[0].type).toBe('dropShadow');

    // action
    await page.getByLabel('Close', { exact: true }).click();

    // result
    await expect(row).not.toHaveClass(/EffectRow__trigger--active/);
  });

  test('an inner shadow is drawn inside the rectangle along the edge away from its offset, follows its values, and disappears when hidden', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-inner-shadow-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.mouse.move(1750, 900);

    const clip = { height: 180, width: 220, x: 690, y: 190 };
    const readChannels = async (x: number, y: number): Promise<number[]> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));
      const index = ((y - clip.y) * png.width + (x - clip.x)) * 4;

      return [png.data[index], png.data[index + 1], png.data[index + 2]];
    };
    const readLuma = async (x: number, y: number): Promise<number> => (await readChannels(x, y))[0];

    // result — with no effect the top edge and the center are the same grey
    const centerLuma = await readLuma(800, 280);

    expect(Math.abs((await readLuma(800, 203)) - centerLuma)).toBeLessThan(4);

    // action
    await addEffect(page, 'Inner shadow');

    // result — the default shadow (y offset 4) darkens the top edge, not the bottom one or the center
    await expect.poll(async () => centerLuma - (await readLuma(800, 203))).toBeGreaterThan(20);
    expect(Math.abs((await readLuma(800, 357)) - centerLuma)).toBeLessThan(6);
    expect(Math.abs((await readLuma(800, 280)) - centerLuma)).toBeLessThan(6);

    // action — a bigger blur spreads the shadow further into the rectangle
    const narrowLuma = await readLuma(800, 214);

    await page.getByLabel('Effect blur').fill('24');
    await page.getByLabel('Effect blur').press('Enter');

    // result
    await expect.poll(async () => (await readLuma(800, 214)) < narrowLuma - 4).toBe(true);

    // action — a colored shadow keeps its color while it fades out, without going dark or grey at the edge
    await page.getByLabel('Effect blur').fill('4');
    await page.getByLabel('Effect blur').press('Enter');

    const hexInput = page.getByLabel('Effect color').locator('..').getByRole('textbox').first();

    await hexInput.fill('ff0000');
    await hexInput.press('Enter');

    // result — every pixel of the fade keeps the red channel at least as high as the grey rectangle
    await expect.poll(async () => (await readChannels(800, 203))[1]).toBeLessThan(centerLuma - 20);
    expect((await readChannels(800, 203))[0]).toBeGreaterThanOrEqual(centerLuma - 3);
    expect((await readChannels(800, 205))[0]).toBeGreaterThanOrEqual(centerLuma - 3);

    // action — hiding the effect removes the shadow again
    await page.getByLabel('Hide effect').click();

    // result
    await expect.poll(async () => Math.abs((await readLuma(800, 203)) - centerLuma)).toBeLessThan(4);
  });

  test('a drop shadow is drawn outside the rectangle on the side of its offset, keeps its color, and disappears when hidden', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-drop-shadow-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.mouse.move(1750, 900);

    const clip = { height: 220, width: 220, x: 690, y: 190 };
    const readChannels = async (x: number, y: number): Promise<number[]> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));
      const index = ((y - clip.y) * png.width + (x - clip.x)) * 4;

      return [png.data[index], png.data[index + 1], png.data[index + 2]];
    };
    const readLuma = async (x: number, y: number): Promise<number> => (await readChannels(x, y))[0];

    // result — with no effect the area just below the rectangle is the plain canvas
    const backgroundLuma = await readLuma(800, 395);

    expect(Math.abs((await readLuma(800, 364)) - backgroundLuma)).toBeLessThan(4);

    // action — a white shadow is easy to tell from the dark canvas
    await addEffect(page, 'Drop shadow');

    const hexInput = page.getByLabel('Effect color').locator('..').getByRole('textbox').first();

    await hexInput.fill('ffffff');
    await hexInput.press('Enter');

    // result — it shows below the rectangle (offset y 4), not above it, and does not reach far away
    await expect.poll(async () => (await readLuma(800, 363)) - backgroundLuma).toBeGreaterThan(15);
    expect(Math.abs((await readLuma(800, 395)) - backgroundLuma)).toBeLessThan(4);
    expect(Math.abs((await readLuma(800, 190)) - backgroundLuma)).toBeLessThan(4);

    // action — a bigger offset moves the shadow further down
    await page.getByLabel('Effect Y offset').fill('20');
    await page.getByLabel('Effect Y offset').press('Enter');

    // result
    await expect.poll(async () => (await readLuma(800, 375)) - backgroundLuma).toBeGreaterThan(15);

    // action — hiding the effect removes the shadow again
    await page.getByLabel('Hide effect').click();

    // result
    await expect.poll(async () => Math.abs((await readLuma(800, 363)) - backgroundLuma)).toBeLessThan(4);
  });

  test('a layer blur softens the rectangle edges in both directions, shows only the Blur field, and disappears when hidden', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-layer-blur-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.mouse.move(1750, 900);

    const clip = { height: 220, width: 220, x: 690, y: 190 };
    const readLuma = async (x: number, y: number): Promise<number> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));

      return png.data[((y - clip.y) * png.width + (x - clip.x)) * 4];
    };

    // result — sharp edge: right outside is the canvas, right inside is the fill
    const backgroundLuma = await readLuma(800, 190);
    const fillLuma = await readLuma(800, 280);

    expect(Math.abs((await readLuma(800, 198)) - backgroundLuma)).toBeLessThan(4);
    expect(Math.abs((await readLuma(800, 204)) - fillLuma)).toBeLessThan(4);

    // action
    await addEffect(page, 'Layer blur');
    await page.getByLabel('Effect blur').fill('16');
    await page.getByLabel('Effect blur').press('Enter');

    // result — only the blur controls are shown
    await expect(page.getByLabel('Effect X offset')).toHaveCount(0);
    await expect(page.getByText('Uniform', { exact: true })).toBeVisible();

    // result — the fill bleeds outward and fades inward at the edge
    await expect.poll(async () => (await readLuma(800, 198)) - backgroundLuma).toBeGreaterThan(5);
    expect(fillLuma - (await readLuma(800, 204))).toBeGreaterThan(8);
    expect(Math.abs((await readLuma(800, 280)) - fillLuma)).toBeLessThan(6);

    // action — hiding the effect makes the edge sharp again
    await page.getByLabel('Hide effect').click();

    // result
    await expect.poll(async () => Math.abs((await readLuma(800, 198)) - backgroundLuma)).toBeLessThan(4);
  });

  test('a progressive layer blur blurs only toward the end handle, and the handles can be dragged with snapping to the node', async ({
    page,
  }) => {
    test.setTimeout(90000);

    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-progressive-blur-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await addEffect(page, 'Layer blur');
    await page.getByText('Progressive', { exact: true }).click();
    await page.getByLabel('Effect blur').fill('10');
    await page.getByLabel('Effect blur').press('Enter');
    await page.mouse.move(1750, 900);

    const clip = { height: 220, width: 220, x: 690, y: 190 };
    const readLuma = async (x: number, y: number): Promise<number> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));

      return png.data[((y - clip.y) * png.width + (x - clip.x)) * 4];
    };

    // result — the panel shows Start and End fields with the saved defaults
    await expect(page.getByLabel('Effect start blur')).toHaveValue('0');
    await expect(page.getByLabel('Effect blur')).toHaveValue('10');

    // result — the start end (top) stays sharp while the end (bottom) bleeds outward
    const backgroundLuma = await readLuma(750, 380);

    await expect.poll(async () => (await readLuma(750, 363)) - backgroundLuma).toBeGreaterThan(8);
    expect(Math.abs((await readLuma(750, 198)) - (await readLuma(750, 190)))).toBeLessThan(4);

    // action — drag the end handle near the left edge, 30px above the bottom
    await page.mouse.move(800, 360);
    await page.waitForTimeout(400);
    await page.mouse.down();
    await page.mouse.move(750, 340, { steps: 4 });
    await page.mouse.move(703, 330, { steps: 4 });
    await page.mouse.up();

    // result — x snapped to the node's left edge, y follows the pointer, the start handle is untouched and the panel stays open
    const end = async (): Promise<{ x: number; y: number } | undefined> => {
      const id = await readFirstNodeId(page);

      return (await readNode(page, id)).effects?.[0].end;
    };

    await expect.poll(async () => (await end())?.x, { timeout: 20000 }).toBe(0);
    expect(((await end())?.y ?? 0) > 0.75 && ((await end())?.y ?? 0) < 0.9).toBe(true);
    expect((await readNode(page, await readFirstNodeId(page))).effects?.[0].start).toBeUndefined();
    await expect(page.getByText('Progressive', { exact: true })).toBeVisible();
  });

  test('a background blur softens only what is behind the layer, inside the layer shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-background-blur-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await designPage.drawRectangle(850, 220, 1000, 340);

    const layerId = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [] }, id }));

      return id;
    });

    expect(layerId).toBeTruthy();

    await addEffect(page, 'Background blur');
    await page.getByLabel('Effect blur').fill('10');
    await page.getByLabel('Effect blur').press('Enter');
    await page.mouse.move(1750, 900);

    const clip = { height: 200, width: 320, x: 690, y: 190 };
    const readLumas = async (points: [number, number][]): Promise<number[]> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));

      return points.map(([x, y]) => png.data[((y - clip.y) * png.width + (x - clip.x)) * 4]);
    };
    const softened = async (): Promise<boolean> => {
      const [inside, outside] = await readLumas([
        [896, 300],
        [902, 300],
      ]);

      return inside < 217 - 10 && outside > 68 + 10;
    };

    // result — inside the layer the hard edge of the rectangle behind it is softened in both directions
    await expect.poll(softened, { timeout: 30000 }).toBe(true);

    // result — outside the layer the same edge stays sharp
    const [nearEdge, farInside, farOutside] = await readLumas([
      [896, 210],
      [880, 210],
      [960, 210],
    ]);

    expect(Math.abs(nearEdge - farInside)).toBeLessThan(4);
    expect(farOutside).toBe(68);
  });

  test('a noise speckles the rectangle with grains of the effect color, fewer of them at a lower density, and none when hidden', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-noise-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await addEffect(page, 'Noise');
    await page.mouse.move(1750, 900);

    const clip = { height: 120, width: 160, x: 720, y: 220 };
    const readDarkShare = async (): Promise<number> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));
      const lumas: number[] = [];

      for (let index = 0; index < png.width * png.height; index += 1) {
        lumas.push(png.data[index * 4]);
      }

      const brightest = Math.max(...lumas);

      return lumas.filter((luma) => luma < brightest - 20).length / lumas.length;
    };

    // result — about half of the grains are darkened at the full density
    await expect.poll(readDarkShare, { timeout: 15000 }).toBeGreaterThan(0.3);
    expect(await readDarkShare()).toBeLessThan(0.7);

    // action
    await page.getByLabel('Effect density').fill('20%');
    await page.getByLabel('Effect density').press('Enter');

    // result — a lower density leaves fewer dark grains
    await expect.poll(readDarkShare, { timeout: 15000 }).toBeLessThan(0.25);
    expect(await readDarkShare()).toBeGreaterThan(0.03);

    // action
    await page.getByLabel('Hide effect').click();

    // result
    await expect.poll(readDarkShare, { timeout: 15000 }).toBeLessThan(0.01);
  });

  test('a duo noise fills the rectangle with two tones, the first color where the noise is high and the second where it is low', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-noise-duo-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await addEffect(page, 'Noise');
    await page.getByText('Duo', { exact: true }).click();
    await page.getByLabel('Effect noise size X').fill('4');
    await page.getByLabel('Effect noise size X').press('Enter');

    const secondHex = page.getByLabel('Effect secondary color').locator('..').getByRole('textbox').first();

    await secondHex.fill('ff0000');
    await secondHex.press('Enter');
    await page.mouse.move(1750, 900);

    const clip = { height: 120, width: 160, x: 720, y: 220 };
    const readShares = async (): Promise<{ dark: number; red: number }> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));
      const total = png.width * png.height;
      let dark = 0;
      let red = 0;

      for (let index = 0; index < total; index += 1) {
        const [r, g] = [png.data[index * 4], png.data[index * 4 + 1]];

        if (r - g > 30) {
          red += 1;
        } else if (r < 190 && Math.abs(r - g) < 6) {
          dark += 1;
        }
      }

      return { dark: dark / total, red: red / total };
    };

    // result — both tones cover a good part of the rectangle and together nearly all of it
    await expect.poll(async () => (await readShares()).red, { timeout: 15000 }).toBeGreaterThan(0.25);

    const { dark, red } = await readShares();

    expect(dark).toBeGreaterThan(0.25);
    expect(dark + red).toBeGreaterThan(0.75);
  });

  test('a multi noise paints colored blobs without a color row, so the rectangle shows more than one hue', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-noise-multi-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await addEffect(page, 'Noise');
    await page.getByText('Multi', { exact: true }).click();
    await page.getByLabel('Effect noise size X').fill('12');
    await page.getByLabel('Effect noise size X').press('Enter');
    await page.getByLabel('Effect opacity').fill('100');
    await page.getByLabel('Effect opacity').press('Enter');
    await page.mouse.move(1750, 900);

    // result — the color rows are gone
    await expect(page.getByLabel('Effect secondary color')).toHaveCount(0);

    const clip = { height: 120, width: 160, x: 720, y: 220 };
    const readHues = async (): Promise<number> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));
      const hues = new Set<number>();

      for (let index = 0; index < png.width * png.height; index += 1) {
        const [r, g, b] = [png.data[index * 4], png.data[index * 4 + 1], png.data[index * 4 + 2]];

        if (Math.max(r, g, b) - Math.min(r, g, b) > 40) {
          hues.add(r >= g && r >= b ? 0 : g >= b ? 1 : 2);
        }
      }

      return hues.size;
    };

    // result — colored pixels dominated by different channels appear across the blobs
    await expect.poll(readHues, { timeout: 15000 }).toBeGreaterThanOrEqual(2);
  });

  test('a frame noise is drawn over the frame children, not under them', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-noise-children-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(700, 200, 1000, 400);
    await addEffect(page, 'Noise');
    await page.getByLabel('Effect noise size X').fill('4');
    await page.getByLabel('Effect noise size X').press('Enter');
    await designPage.drawRectangle(1200, 200, 1300, 280);
    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { moveNodes, updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const [frameId, childId] = pages[activePageId].rootOrder;

      store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: frameId }));
      store.dispatch(updateNode({ changes: { height: 80, width: 100, x: 800, y: 280 }, id: childId }));
    });
    await page.mouse.move(1750, 900);

    const clip = { height: 60, width: 80, x: 810, y: 290 };
    const readDarkShare = async (): Promise<number> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));
      const lumas: number[] = [];

      for (let index = 0; index < png.width * png.height; index += 1) {
        lumas.push(png.data[index * 4]);
      }

      const brightest = Math.max(...lumas);

      return lumas.filter((luma) => luma < brightest - 20).length / lumas.length;
    };

    // result — inside the child rectangle the noise still darkens about half of the area
    await expect.poll(readDarkShare, { timeout: 15000 }).toBeGreaterThan(0.25);
    expect(await readDarkShare()).toBeLessThan(0.75);
  });

  test('hovering a blend mode in the effect panel previews it on the canvas, and choosing it keeps it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-blend-mode-canvas');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await addEffect(page, 'Inner shadow');
    await page.mouse.move(1750, 900);

    const clip = { height: 180, width: 220, x: 690, y: 190 };
    const readLuma = async (x: number, y: number): Promise<number> => {
      const { PNG } = await import('pngjs');
      const png = PNG.sync.read(await page.screenshot({ clip }));

      return png.data[((y - clip.y) * png.width + (x - clip.x)) * 4];
    };
    const readDarkening = async (): Promise<number> => (await readLuma(800, 280)) - (await readLuma(800, 203));

    // result — a normal dark shadow darkens the top edge
    await expect.poll(readDarkening).toBeGreaterThan(20);

    // action — hovering Screen previews it: a dark shadow screened over grey no longer darkens
    await page.getByLabel('Apply blend mode to effect').click();
    await page.getByText('Screen', { exact: true }).hover();

    // result
    await expect.poll(async () => Math.abs(await readDarkening())).toBeLessThan(6);

    // action — moving the pointer to another option changes the preview back
    await page.getByText('Normal', { exact: true }).hover();

    // result
    await expect.poll(readDarkening).toBeGreaterThan(20);

    // action — leaving the menu without choosing keeps the committed value
    await page.getByText('Screen', { exact: true }).hover();
    await page.getByLabel('Apply blend mode to effect').click();
    await page.mouse.move(1750, 900);

    // result
    await expect.poll(readDarkening).toBeGreaterThan(20);

    // action — choosing Screen commits it
    await page.getByLabel('Apply blend mode to effect').click();
    await page.getByText('Screen', { exact: true }).click();
    await page.mouse.move(1750, 900);

    // result
    await expect.poll(async () => Math.abs(await readDarkening())).toBeLessThan(6);
  });

  test('effects can be hidden and deleted, and dragging a row past another reorders them with a drop indicator', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-effects-section-reorder');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await addEffect(page, 'Inner shadow');
    await addEffect(page, 'Drop shadow');

    // action
    const hideButtons = page.getByLabel('Hide effect');

    await hideButtons.nth(1).click();

    // result
    expect((await readNode(page, id)).effects?.map((effect) => effect.visible)).toEqual([undefined, false]);

    // action: drag the first row's handle past the second row
    const handles = page.getByLabel('Reorder effect');
    const fromBox = (await handles.nth(0).boundingBox())!;
    const toBox = (await handles.nth(1).boundingBox())!;

    await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height, { steps: 10 });

    // result
    await expect(page.locator('[class*="FillDropIndicator"]')).toBeVisible();

    await page.mouse.up();

    expect((await readNode(page, id)).effects?.map((effect) => effect.type)).toEqual(['dropShadow', 'innerShadow']);

    // action
    await page.getByLabel('Delete effect').first().click();

    // result
    expect((await readNode(page, id)).effects?.map((effect) => effect.type)).toEqual(['innerShadow']);
  });
});
