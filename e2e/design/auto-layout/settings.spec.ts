import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';

// components
import { DesignPage } from '../model/DesignPage';

// One shared round-trip check for the Auto layout settings popover: every row in it follows the same
// path (a control in the popover -> commitXChange -> updateNode -> the layout engine reruns -> the
// canvas repaints). The unit suite already pins each commit util, each hook and the per-setting
// engine maths; what only a real browser proves is that the actual popover control dispatches and
// the engine reacts end to end. So these tests drive the real controls and read the resulting child
// geometry back out of the store, the same way gap-handles.spec.ts does.

const ROW_FRAME = { x1: 600, x2: 900, y1: 150, y2: 250 };
const OVERLAP_FRAME = { x1: 600, x2: 760, y1: 150, y2: 300 };

const setFlowHorizontal = async (page: Page): Promise<void> => {
  await page.locator('[data-test-toggle-button-group="flow"]').getByLabel('Horizontal', { exact: true }).click();
};

const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

// a plain canvas click on a frame that has children no longer resolves to the frame (a known,
// separately-tracked bug), so reselect it through the store like gap-handles.spec.ts
const selectTheFrame = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [frameId] = pages[activePageId].rootOrder;

    store.dispatch(setSelection([frameId]));
  });

const setChildFills = (page: Page, fills: string[]): Promise<void> =>
  page.evaluate(async (childFills: string[]) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [frameId] = pages[activePageId].rootOrder;
    const frame = pages[activePageId].nodes[frameId] as unknown as { childIds: string[] };

    frame.childIds.forEach((id, index) => {
      store.dispatch(updateNode({ changes: { fill: childFills[index] }, id }));
    });
  }, fills);

const selectAutoGap = async (page: Page): Promise<void> => {
  await page.locator('[aria-label="Horizontal gap options"]').first().click();
  await page.getByText('Auto', { exact: true }).click();
};

const settings = (page: Page): ReturnType<Page['locator']> => page.locator('[class*="PopoverAutoLayoutSettings_"]').first();

const openSettings = async (page: Page): Promise<void> => {
  await page.getByLabel('Properties', { exact: true }).click();
  await expect(settings(page)).toBeVisible();
};

const pickOption = async (page: Page, trigger: string, option: string): Promise<void> => {
  await settings(page).getByRole('button', { exact: true, name: trigger }).click();

  const panel = page.locator('[class*="DropdownPanel_"]');

  await expect(panel).toBeVisible();
  // the option's clickable container and its label span both match [class*="DropdownOption_"];
  // .first() is the container div (document order), which carries the onClick
  await panel.locator('[class*="DropdownOption_"]').filter({ hasText: option }).first().click();
  await expect(panel).toBeHidden();
};

const getChildrenX = (page: Page): Promise<number[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

    return frame.childIds.map((childId) => Math.round((activePage.nodes[childId] as unknown as { x: number }).x));
  });

const pixelAt = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  // let the rAF-driven canvas repaint the frame that follows the setting change before sampling
  await page.waitForTimeout(120);
  const shot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const { data } = PNG.sync.read(shot);

  return [data[0], data[1], data[2]];
};

test.describe('auto-layout — Auto layout settings popover', () => {
  test('the Layout version control reruns the engine: legacy centres a lone "between" child, updated keeps it at the start', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-settings-layout-version');
    await expect(designPage.canvas).toBeVisible();

    // a 300-wide frame with a single 60-wide child, distributed with an auto gap ("between")
    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 200 });
    await selectTheFrame(page);
    await selectAutoGap(page);

    await openSettings(page);

    await pickOption(page, 'Updated', 'Legacy');
    // legacy centres the lone child: 600 + (300 - 60) / 2
    expect(await getChildrenX(page)).toEqual([720]);

    await pickOption(page, 'Legacy', 'Updated');
    // updated pins it to the start padding edge
    expect(await getChildrenX(page)).toEqual([600]);

    await pickOption(page, 'Updated', 'Legacy');
    expect(await getChildrenX(page)).toEqual([720]);
  });

  test('the Auto spacing control redistributes the row: between / around / evenly each place the children differently', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-settings-auto-spacing');
    await expect(designPage.canvas).toBeVisible();

    // a 300-wide frame with three 40-wide children and an auto gap
    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);

    for (const targetX of [650, 750, 850]) {
      await designPage.drawRectangle(1400, 160, 1440, 200);
      await dragInto(page, { x: 1420, y: 180 }, { x: targetX, y: 200 });
    }

    await selectTheFrame(page);
    await selectAutoGap(page);
    await openSettings(page);

    // an auto gap defaults to "between": 300 - 120 content = 180 leftover across 2 gaps -> 90 each
    const between = await getChildrenX(page);

    expect(between).toEqual([600, 730, 860]);

    await pickOption(page, 'Between', 'Around');
    const around = await getChildrenX(page);

    // "around" pads both ends, so the first child no longer sits flush at the frame edge
    expect(around[0]).toBeGreaterThan(600);
    expect(around).not.toEqual(between);

    await pickOption(page, 'Around', 'Evenly');
    const evenly = await getChildrenX(page);

    expect(evenly).not.toEqual(between);
    expect(evenly).not.toEqual(around);

    await pickOption(page, 'Evenly', 'Between');
    expect(await getChildrenX(page)).toEqual(between);
  });

  test('the Canvas stacking control flips which overlapping child paints on top', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-settings-canvas-stacking');
    await expect(designPage.canvas).toBeVisible();

    // a 160-wide frame with two 120-wide children: under legacy the auto "between" gap goes negative
    // (-80), so the children overlap by 80px — child 0 at x600, child 1 at x640, overlap x[640,720]
    await designPage.drawFrame(OVERLAP_FRAME.x1, OVERLAP_FRAME.y1, OVERLAP_FRAME.x2, OVERLAP_FRAME.y2);
    await setFlowHorizontal(page);

    for (const targetX of [650, 700]) {
      await designPage.drawRectangle(1400, 160, 1520, 280);
      await dragInto(page, { x: 1460, y: 220 }, { x: targetX, y: 220 });
    }

    await selectTheFrame(page);
    await setChildFills(page, ['#ff0000', '#0000ff']);
    await selectAutoGap(page);
    await openSettings(page);
    await pickOption(page, 'Updated', 'Legacy');

    // sample the overlap region; default "last on top" shows child 1 (blue)
    await pickOption(page, 'Last on top', 'Last on top');
    const [, , lastOnTopBlue] = await pixelAt(page, 680, 220);

    expect(lastOnTopBlue).toBeGreaterThan(200);

    // "first on top" brings child 0 (red) forward in the same overlap
    await pickOption(page, 'Last on top', 'First on top');
    const [firstOnTopRed, , firstOnTopBlue] = await pixelAt(page, 680, 220);

    expect(firstOnTopRed).toBeGreaterThan(200);
    expect(firstOnTopBlue).toBeLessThan(80);

    await pickOption(page, 'First on top', 'Last on top');
    const [, , restoredBlue] = await pixelAt(page, 680, 220);

    expect(restoredBlue).toBeGreaterThan(200);
  });
});
