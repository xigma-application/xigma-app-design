import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const shapeArea = { height: 260, width: 260, x: 670, y: 170 };

const createUnion = async (page: Page, projectId: string): Promise<void> => {
  const designPage = new DesignPage(page);

  await designPage.goto(projectId);
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 820, 320);
  await designPage.drawRectangle(760, 260, 880, 380);
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { booleanNodes, setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
    store.dispatch(booleanNodes('union'));
    store.dispatch(setSelection([]));
  });
};

const updateUnion = (page: Page, changes: Record<string, unknown>): Promise<void> =>
  page.evaluate(async (unionChanges) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [id] = pages[activePageId].rootOrder;

    store.dispatch(updateNode({ changes: unionChanges, id }));
  }, changes);

const EFFECTS = [
  { blur: 12, color: '#000000', opacity: 80, spread: 0, type: 'dropShadow', x: 10, y: 10 },
  { blur: 8, color: '#000000', opacity: 80, spread: 0, type: 'innerShadow', x: 6, y: 6 },
  { blur: 0, color: '#000000', density: 60, noiseSize: 2, opacity: 100, spread: 0, type: 'noise', x: 0, y: 0 },
  { blur: 0, clipToShape: true, color: '#000000', noiseSize: 4, opacity: 100, radius: 4, spread: 0, type: 'texture', x: 0, y: 0 },
];

EFFECTS.forEach((effect) => {
  test(`a ${effect.type} effect on a Union is drawn around its shape`, async ({ page }) => {
    await createUnion(page, `e2e-test-boolean-effect-${effect.type}`);

    const plain = await page.screenshot({ clip: shapeArea });

    await updateUnion(page, { effects: [{ ...effect, visible: true }] });
    await expect.poll(async () => (await page.screenshot({ clip: shapeArea })).equals(plain)).toBe(false);
  });
});

test('a pattern fill on a Union is drawn inside its shape', async ({ page }) => {
  await createUnion(page, 'e2e-test-boolean-pattern');

  const insideArea = { height: 60, width: 60, x: 730, y: 230 };
  const plain = await page.screenshot({ clip: insideArea });

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes } = await import('/src/store/design/slice.ts');

    store.dispatch(
      addNodes({
        nodes: [
          {
            fill: '#e24a4a',
            height: 10,
            id: 'patternSource',
            name: 'Source',
            parentId: null,
            rotation: 0,
            type: 'ellipse',
            width: 10,
            x: -500,
            y: -500,
          },
        ],
        rootIds: ['patternSource'],
      }),
    );
  });
  await updateUnion(page, {
    fills: [
      {
        alignmentIndex: 4,
        direction: 'horizontal',
        offsetX: 0,
        offsetY: 0,
        opacity: 100,
        scale: 1,
        sourceNodeId: 'patternSource',
        spacingX: 4,
        spacingY: 4,
        tileType: 'rectangular',
        type: 'pattern',
      },
    ],
  });

  await expect.poll(async () => (await page.screenshot({ clip: insideArea })).equals(plain)).toBe(false);
});
