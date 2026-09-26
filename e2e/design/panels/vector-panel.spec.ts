import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

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

test('a selected vector shows the Vector path panel whose position, size and rotation fields move, resize and turn it', async ({ page }) => {
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
