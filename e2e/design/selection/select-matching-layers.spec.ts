import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test.describe.configure({ mode: 'serial' });

// two top-level frames with the same inner structure (Header > Title), plus a third frame whose
// Title sits one level higher, so it must not match
const seedScene = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes } = await import('/src/store/design/slice.ts');
    const box = (x: number, y: number, size: number): object => ({ height: size, rotation: 0, width: size, x, y });
    const frame = (id: string, name: string, parentId: string | null, childIds: string[], x: number, y: number, size: number): object => ({
      ...box(x, y, size),
      childIds,
      clipContent: false,
      fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
      id,
      name,
      parentId,
      type: 'frame',
    });
    const rect = (id: string, name: string, parentId: string, x: number, y: number): object => ({
      ...box(x, y, 40),
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      id,
      name,
      parentId,
      type: 'rectangle',
    });

    store.dispatch(
      addNodes({
        nodes: [
          frame('screen-a', 'Screen A', null, ['header-a'], 300, 200, 300),
          frame('header-a', 'Header', 'screen-a', ['title-a'], 320, 220, 120),
          rect('title-a', 'Title', 'header-a', 340, 240),
          frame('screen-b', 'Screen B', null, ['header-b'], 700, 200, 300),
          frame('header-b', 'Header', 'screen-b', ['title-b'], 720, 220, 120),
          rect('title-b', 'Title', 'header-b', 740, 240),
          frame('screen-c', 'Screen C', null, ['title-c'], 1100, 200, 300),
          rect('title-c', 'Title', 'screen-c', 1140, 240),
        ] as never,
        rootIds: ['screen-a', 'screen-b', 'screen-c'],
      }),
    );
  });

const selectNodes = (page: Page, nodeIds: string[]): Promise<void> =>
  page.evaluate(async (ids) => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');

    store.dispatch(setSelection(ids));
  }, nodeIds);

const readSelectedIds = (page: Page): Promise<string[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

const openSeededScene = async (page: Page, projectId: string): Promise<void> => {
  const designPage = new DesignPage(page);

  await designPage.goto(projectId);
  await expect(designPage.canvas).toBeVisible();
  await seedScene(page);
};

test.describe('Select matching layers', () => {
  test('the panel header button adds the layer with the same name path from the other top-level frame', async ({ page }) => {
    await openSeededScene(page, 'e2e-test-select-matching-layers-button');

    await selectNodes(page, ['title-a']);
    await page.getByLabel('Select matching layers').click();

    expect(await readSelectedIds(page)).toEqual(['title-a', 'title-b']); // title-c sits at a different depth
  });

  test('Alt+Ctrl+A adds the layer with the same name path from the other top-level frame', async ({ page }) => {
    await openSeededScene(page, 'e2e-test-select-matching-layers-shortcut');

    await selectNodes(page, ['header-b']);
    await page.keyboard.press('Control+Alt+KeyA');

    expect(await readSelectedIds(page)).toEqual(['header-b', 'header-a']);
  });

  test('a layer without matches shows the "No matching layers" snackbar and keeps the selection', async ({ page }) => {
    await openSeededScene(page, 'e2e-test-select-matching-layers-no-matches');

    await selectNodes(page, ['title-c']); // Screen C has no Title at the same depth anywhere else
    await page.getByLabel('Select matching layers').click();

    await expect(page.getByText('No matching layers to select on page')).toBeVisible();
    expect(await readSelectedIds(page)).toEqual(['title-c']);
  });

  test('the button is hidden when a top-level frame is selected', async ({ page }) => {
    await openSeededScene(page, 'e2e-test-select-matching-layers-top-level');

    await selectNodes(page, ['header-a']);
    await expect(page.getByLabel('Select matching layers')).toHaveCount(1);

    await selectNodes(page, ['screen-a']);
    await expect(page.getByLabel('Select matching layers')).toHaveCount(0);
  });
});
