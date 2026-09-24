import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TFrameSetup = { childCount: number; gridColumnCount?: number; gridRowCount?: number; layoutMode: string; padding: number; x: number };

type TFrameState = { gridColumnCount?: number; gridRowCount?: number; paddingLeft?: number; paddingRight?: number };

const addFramesAndSelectThem = (page: Page, setups: TFrameSetup[]): Promise<void> =>
  page.evaluate(async (frames) => {
    const { store } = await import('/src/store/index.ts');
    const { addNode, moveNodes, setSelection } = await import('/src/store/design/slice.ts');
    const readRootOrder = (): string[] => {
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].rootOrder;
    };
    const lastRootId = (): string => readRootOrder()[readRootOrder().length - 1];
    const frameIds = frames.map((frame) => {
      store.dispatch(
        addNode({
          childIds: [],
          clipContent: true,
          fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
          gridColumnCount: frame.gridColumnCount,
          gridRowCount: frame.gridRowCount,
          height: 200,
          layoutMode: frame.layoutMode,
          name: 'Frame',
          paddingBottom: frame.padding,
          paddingLeft: frame.padding,
          paddingRight: frame.padding,
          paddingTop: frame.padding,
          parentId: null,
          rotation: 0,
          type: 'frame',
          width: 200,
          x: frame.x,
          y: 200,
        } as never),
      );

      const frameId = lastRootId();

      Array.from({ length: frame.childCount }).forEach(() => {
        store.dispatch(
          addNode({
            fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
            height: 20,
            name: 'Rectangle',
            parentId: null,
            rotation: 0,
            type: 'rectangle',
            width: 20,
            x: 0,
            y: 0,
          } as never),
        );
        store.dispatch(moveNodes({ nodeIds: [lastRootId()], targetIndex: 0, targetParentId: frameId }));
      });

      return frameId;
    });

    store.dispatch(setSelection(frameIds));
  }, setups);

const readRootFrames = (page: Page): Promise<TFrameState[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return activePage.rootOrder.map((id) => {
      const { gridColumnCount, gridRowCount, paddingLeft, paddingRight } = activePage.nodes[id] as unknown as TFrameState;

      return { gridColumnCount, gridRowCount, paddingLeft, paddingRight };
    });
  });

test.describe('Layout section with several frames selected', () => {
  test('horizontal padding shows Mixed, a typed value sets it on both frames and the field shows it, and Ctrl+Z restores both in one step', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-multi-layout-padding');
    await expect(designPage.canvas).toBeVisible();

    await addFramesAndSelectThem(page, [
      { childCount: 0, layoutMode: 'horizontal', padding: 5, x: 600 },
      { childCount: 0, layoutMode: 'horizontal', padding: 10, x: 900 },
    ]);

    const paddingInput = page.locator('[data-test-text-field-input="padding-horizontal"]');

    await expect(paddingInput).toHaveValue('Mixed');

    await paddingInput.click();
    await paddingInput.fill('20');
    await paddingInput.press('Enter');

    expect((await readRootFrames(page)).map(({ paddingLeft, paddingRight }) => [paddingLeft, paddingRight])).toEqual([
      [20, 20],
      [20, 20],
    ]);
    await expect(paddingInput).toHaveValue('20');

    await paddingInput.blur();
    await page.keyboard.press('Control+z');

    expect((await readRootFrames(page)).map(({ paddingLeft }) => paddingLeft)).toEqual([5, 10]);
    await expect(paddingInput).toHaveValue('Mixed');
  });

  test('the grid area shows Mixed, a picked cell gives both frames the grid grown to fit the frame with the most children, and Ctrl+Z restores both in one step', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-multi-layout-grid-area');
    await expect(designPage.canvas).toBeVisible();

    await addFramesAndSelectThem(page, [
      { childCount: 5, gridColumnCount: 3, gridRowCount: 2, layoutMode: 'grid', padding: 0, x: 600 },
      { childCount: 1, gridColumnCount: 2, gridRowCount: 2, layoutMode: 'grid', padding: 0, x: 900 },
    ]);

    await page.locator('[data-test-grid-area]').click();

    await expect(page.getByLabel('Columns', { exact: true })).toHaveValue('Mixed');
    await expect(page.getByRole('button', { name: 'Open grid settings' })).toHaveCount(0);

    await page.locator('[data-value="2.2"]').click();

    expect((await readRootFrames(page)).map(({ gridColumnCount, gridRowCount }) => [gridColumnCount, gridRowCount])).toEqual([
      [2, 3],
      [2, 3],
    ]);

    await page.keyboard.press('Control+z');

    expect((await readRootFrames(page)).map(({ gridColumnCount, gridRowCount }) => [gridColumnCount, gridRowCount])).toEqual([
      [3, 2],
      [2, 2],
    ]);
  });
});

test('with two rectangles selected, typing a horizontal Spacing moves the second one to that gap after the first', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-layout-spacing');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 800, 300);
  await designPage.drawRectangle(900, 200, 1000, 300);
  await designPage.click(750, 250, { shift: true });

  const spacing = page.locator('[data-test-text-field-input="spacing-horizontal"]');

  await expect(spacing).toHaveValue('100');

  await spacing.click();
  await spacing.fill('20');
  await spacing.press('Enter');

  const xs = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return rootOrder.map((id) => (nodes[id] as { x: number }).x).sort((a, b) => a - b);
  });

  expect(xs[1] - xs[0]).toBe(120);
});

test('with a grid of rectangles selected, Spacing shows the gap between columns and rows and a typed value moves whole columns', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-layout-spacing-grid');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 800, 300);
  await designPage.drawRectangle(900, 200, 1000, 300);
  await designPage.drawRectangle(700, 400, 780, 480);
  await designPage.click(750, 250, { shift: true });
  await designPage.click(950, 250, { shift: true });

  const horizontal = page.locator('[data-test-text-field-input="spacing-horizontal"]');
  const vertical = page.locator('[data-test-text-field-input="spacing-vertical"]');

  await expect(horizontal).toHaveValue('100');
  await expect(vertical).toHaveValue('100');

  await horizontal.click();
  await horizontal.fill('50');
  await horizontal.press('Enter');

  const xs = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return rootOrder.map((id) => (nodes[id] as { x: number }).x);
  });

  expect(xs[1] - xs[0]).toBe(150);
  expect(xs[2]).toBe(xs[0]);
});
