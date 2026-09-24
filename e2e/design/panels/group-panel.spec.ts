import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TNodeState = { height: number; opacity?: number; type: string; width: number; x: number; y: number };

const drawTwoRectanglesAndGroupThem = async (designPage: DesignPage, page: Page): Promise<void> => {
  await designPage.drawRectangle(700, 200, 800, 300);
  await designPage.drawRectangle(900, 200, 1000, 300);
  await designPage.click(750, 250, { shift: true });
  await page.keyboard.press('Control+g');
};

const readGroupAndChildren = (page: Page): Promise<{ children: TNodeState[]; group: TNodeState }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const group = nodes[rootOrder[0]] as unknown as TNodeState & { childIds: string[] };
    const pick = ({ height, opacity, type, width, x, y }: TNodeState): TNodeState => ({ height, opacity, type, width, x, y });

    return { children: group.childIds.map((id) => pick(nodes[id] as unknown as TNodeState)), group: pick(group) };
  });

test('a selected group shows the Group panel whose opacity goes to its children and whose width scales them', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-panel');
  await expect(designPage.canvas).toBeVisible();

  await drawTwoRectanglesAndGroupThem(designPage, page);

  await expect(page.locator('[data-test-component-header="group"]').getByText('Group', { exact: true })).toBeVisible();

  const opacityInput = page.locator('[data-test-text-field-input="opacity"]');

  await opacityInput.click();
  await opacityInput.fill('50');
  await opacityInput.press('Enter');

  const widthInput = page.locator('[data-test-text-field-input="width"]');
  const { children: childrenBefore, group: before } = await readGroupAndChildren(page);

  await widthInput.click();
  await widthInput.fill(String(before.width * 2));
  await widthInput.press('Enter');

  const { children, group } = await readGroupAndChildren(page);

  expect(group.opacity).toBeUndefined();
  expect(children.map(({ opacity }) => opacity)).toEqual([0.5, 0.5]);
  expect(group.width).toBe(before.width * 2);
  expect(children.map(({ width, x }) => ({ width: Math.round(width), x: Math.round(x) }))).toEqual(
    childrenBefore.map(({ width, x }) => ({ width: Math.round(width * 2), x: Math.round(before.x + (x - before.x) * 2) })),
  );
});

test('picking Frame in the Group header menu turns the group into a frame around the same children', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-panel-frame');
  await expect(designPage.canvas).toBeVisible();

  await drawTwoRectanglesAndGroupThem(designPage, page);

  const { group: before } = await readGroupAndChildren(page);

  await page.getByLabel('Element type', { exact: true }).click();
  await page.getByText('Frame', { exact: true }).click();

  await expect(page.locator('[data-test-component-header="frame"]')).toBeVisible();

  const { children, group } = await readGroupAndChildren(page);

  expect(group).toMatchObject({ height: before.height, type: 'frame', width: before.width, x: before.x, y: before.y });
  expect(children).toHaveLength(2);
});

const addGroups = (page: Page, count: number): Promise<string[]> =>
  page.evaluate(async (groupCount) => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, groupNodes, setSelection } = await import('/src/store/design/slice.ts');
    const readSelection = (): string[] => {
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].selectedIds;
    };

    const groupIds = Array.from({ length: groupCount }).map((_, groupIndex) => {
      const ids = [`g${groupIndex}a`, `g${groupIndex}b`];

      store.dispatch(
        addNodes({
          nodes: ids.map((id, index) => ({
            fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
            height: 40,
            id,
            name: 'Rectangle',
            parentId: null,
            rotation: 0,
            type: 'rectangle',
            width: 40,
            x: 600 + index * 60,
            y: 200 + groupIndex * 100,
          })),
          rootIds: ids,
        } as never),
      );
      store.dispatch(setSelection(ids));
      store.dispatch(groupNodes());

      return readSelection()[0];
    });

    store.dispatch(setSelection(groupIds));

    return groupIds;
  }, count);

const readOpacities = (page: Page): Promise<(number | undefined)[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return Object.values(pages[activePageId].nodes).map((node) => (node as { opacity?: number }).opacity);
  });

test('two selected groups show the Group panel whose opacity goes to all their children and whose Boolean button turns each group into its own Union', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-panel-multi');
  await expect(designPage.canvas).toBeVisible();

  const groupIds = await addGroups(page, 2);

  await expect(page.locator('[data-test-component-header="group"]').getByText('Group', { exact: true })).toBeVisible();
  await expect(page.getByText('Fill', { exact: true })).toBeVisible();

  const opacityInput = page.locator('[data-test-text-field-input="opacity"]');

  await opacityInput.click();
  await opacityInput.fill('40');
  await opacityInput.press('Enter');

  expect((await readOpacities(page)).sort()).toEqual([0.4, 0.4, 0.4, 0.4, undefined, undefined]);

  await page.getByLabel('Boolean operations', { exact: true }).click();

  const converted = await page.evaluate(async (ids) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes } = pages[activePageId];

    return ids.map((id) => ({ childCount: (nodes[id] as { childIds: string[] }).childIds.length, type: nodes[id].type }));
  }, groupIds);

  expect(converted).toEqual([
    { childCount: 2, type: 'boolean' },
    { childCount: 2, type: 'boolean' },
  ]);
});

test('a group and a frame from different parents show the "2 selected" panel without Wrap in new section', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-panel-multi-parents');
  await expect(designPage.canvas).toBeVisible();

  const [groupId] = await addGroups(page, 1);

  await page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { addNode, moveNodes, setSelection } = await import('/src/store/design/slice.ts');
    const readRootOrder = (): string[] => {
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].rootOrder;
    };
    const addFrame = (x: number): string => {
      store.dispatch(
        addNode({
          childIds: [],
          clipContent: true,
          fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
          height: 100,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: 'frame',
          width: 100,
          x,
          y: 500,
        } as never),
      );

      return readRootOrder()[readRootOrder().length - 1];
    };
    const outerFrameId = addFrame(900);
    const innerFrameId = addFrame(910);

    store.dispatch(moveNodes({ nodeIds: [innerFrameId], targetIndex: 0, targetParentId: outerFrameId }));
    store.dispatch(setSelection([id, innerFrameId]));
  }, groupId);

  await expect(page.locator('[data-test-component-header="mixed"]').getByText('2 selected', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Wrap in new section', { exact: true })).toHaveCount(0);
});
