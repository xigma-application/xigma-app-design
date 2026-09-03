import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test.describe.configure({ mode: 'serial' });

// v1(900,300) -> v2(1050,300) -> v3(1050,450), all plain clicks (no curve), left open — same shape
// as vector-edit.spec.ts's own drawOpenTriangle, duplicated locally so this file has no cross-file
// dependency on that spec
const drawOpenTriangle = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1050, y: 300 },
    { x: 1050, y: 450 },
  ]);
};

const neutral = { x: 1400, y: 700 };

test.describe('Shapes (not editing a vector node)', () => {
  test('Ctrl+A selects every shape node on the canvas', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-shapes-select-all');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(700, 100, 740, 140); // A
    await designPage.drawFrame(900, 100, 940, 140); // B — auto-selected on creation, leaving A unselected

    await designPage.click(1500, 700); // deselect everything
    await designPage.pointerMove(neutral.x, neutral.y);
    const baseline = await designPage.canvas.screenshot();

    await page.keyboard.press('Control+a');
    await designPage.pointerMove(neutral.x, neutral.y);
    const afterSelectAll = await designPage.canvas.screenshot();

    expect(afterSelectAll.equals(baseline)).toBe(false); // shared group outline now spans both A and B
  });

  test('Ctrl+C then Ctrl+V duplicates the copied shape, offset by (10,10), once nothing is selected', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-shapes-copy-paste');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 100, 740, 140); // auto-selected on creation

    await page.keyboard.press('Control+c');
    await designPage.click(1500, 700); // deselect — with nothing selected, paste can't replace, so it clones instead
    await page.keyboard.press('Control+v');

    // only the pasted copy (offset +10,+10) covers this point — the original rectangle spans
    // 700-740,100-140, so 745,145 falls just outside it but squarely inside the copy at 710-750,110-150
    await designPage.click(745, 145);
    const withPaste = await designPage.canvas.screenshot();

    await designPage.goto('e2e-test-copy-paste-select-all-shapes-copy-paste-reference');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 100, 740, 140); // same shape, but no copy/paste performed

    await designPage.click(745, 145); // same point — hits nothing without the paste
    const withoutPaste = await designPage.canvas.screenshot();

    expect(withPaste.equals(withoutPaste)).toBe(false);
  });

  test('Ctrl+C then Ctrl+V replaces the still-selected shape in place instead of cloning it, matching Paste to replace', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-shapes-paste-to-replace-selected');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 100, 740, 140); // auto-selected on creation
    await designPage.pointerMove(neutral.x, neutral.y);
    const baseline = await designPage.canvas.screenshot();

    await page.keyboard.press('Control+c'); // node stays selected
    await page.keyboard.press('Control+v');
    await designPage.pointerMove(neutral.x, neutral.y);
    const afterPaste = await designPage.canvas.screenshot();

    // the rectangle was replaced with an identical copy of itself, in the same slot — no offset clone appeared
    expect(afterPaste.equals(baseline)).toBe(true);
  });

  test('Ctrl+V with nothing ever copied on this page leaves the canvas unchanged', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-shapes-paste-without-copy');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 100, 740, 140);
    await designPage.click(1500, 700); // deselect
    await designPage.pointerMove(neutral.x, neutral.y);
    const baseline = await designPage.canvas.screenshot();

    await page.keyboard.press('Control+v');
    await designPage.pointerMove(neutral.x, neutral.y);
    const afterPaste = await designPage.canvas.screenshot();

    expect(afterPaste.equals(baseline)).toBe(true);
  });
});

test.describe('Vector node selected as a whole (not editing it)', () => {
  test('Ctrl+A also selects a vector node sitting alongside a plain shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-mixed-select-all');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(700, 100, 740, 140); // plain shape node

    await drawOpenTriangle(designPage); // vector node, left in Vector Edit Mode
    await designPage.selectTool('default'); // exit edit mode — node stays selected

    await designPage.click(1500, 700); // deselect everything
    await designPage.pointerMove(neutral.x, neutral.y);
    const baseline = await designPage.canvas.screenshot();

    await page.keyboard.press('Control+a');
    await designPage.pointerMove(neutral.x, neutral.y);
    const afterSelectAll = await designPage.canvas.screenshot();

    expect(afterSelectAll.equals(baseline)).toBe(false); // group outline now spans the frame and the vector node
  });

  test('Ctrl+C then Ctrl+V duplicates a copied (not editing) vector node, offset the same way as an ordinary shape, once nothing is selected', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-vector-node-copy-paste');
    await expect(designPage.canvas).toBeVisible();

    await drawOpenTriangle(designPage); // v1(900,300) v2(1050,300) v3(1050,450)
    await designPage.selectTool('default'); // exit edit mode — whole node stays selected

    await page.keyboard.press('Control+c');
    await designPage.click(1500, 700); // deselect — with nothing selected, paste can't replace, so it clones instead
    await page.keyboard.press('Control+v');

    // the pasted copy's v1-v2 edge runs from (910,310) to (1060,310) — clicking off its own
    // midpoint, the same "select the segment" technique vector-edit.spec.ts uses, hits only the copy
    await designPage.click(950, 310);
    const withPaste = await designPage.canvas.screenshot();

    await designPage.goto('e2e-test-copy-paste-select-all-vector-node-copy-paste-reference');
    await expect(designPage.canvas).toBeVisible();

    await drawOpenTriangle(designPage);
    await designPage.selectTool('default'); // same setup, no copy/paste

    await designPage.click(950, 310); // same point — hits nothing without the paste
    const withoutPaste = await designPage.canvas.screenshot();

    expect(withPaste.equals(withoutPaste)).toBe(false);
  });
});

test.describe('During Vector Edit Mode (editing vertices/segments)', () => {
  test('Select All while editing selects every vertex of the node, not the whole shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-vector-edit-select-all');
    await expect(designPage.canvas).toBeVisible();

    await drawOpenTriangle(designPage);
    await designPage.selectVectorEditMoveTool();

    await designPage.click(1400, 700); // miss-click: deselects the active vertex, keeps edit mode open
    await designPage.pointerMove(neutral.x, neutral.y);
    const baseline = await designPage.canvas.screenshot();

    await page.keyboard.press('Control+a');
    await designPage.pointerMove(neutral.x, neutral.y);
    const afterSelectAll = await designPage.canvas.screenshot();

    expect(afterSelectAll.equals(baseline)).toBe(false); // all three vertices now render selected
  });

  test('Copy alone, with a segment selected, does not itself change the rendered canvas', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-vector-edit-copy-only');
    await expect(designPage.canvas).toBeVisible();

    await drawOpenTriangle(designPage);
    await designPage.selectVectorEditMoveTool();

    await designPage.click(940, 300); // select the v1-v2 segment (off its own midpoint)
    await designPage.pointerMove(neutral.x, neutral.y);
    // the layers-tree node icon starts as an empty <path d=""> and only fills in once the vector's
    // outline is derived a beat later; wait for it so the baseline isn't captured mid-paint —
    // otherwise Copy's own no-op re-render is what "reveals" the icon
    await expect(page.locator('span[class*="TreeItem__icon"] path[d]:not([d=""])')).toBeAttached();
    const beforeCopy = await designPage.canvas.screenshot();

    await page.keyboard.press('Control+c'); // writes to an in-memory clipboard only — no dispatch
    await designPage.pointerMove(neutral.x, neutral.y);
    const afterCopy = await designPage.canvas.screenshot();

    expect(afterCopy.equals(beforeCopy)).toBe(true);
  });

  test('Pasting while editing with nothing copied for this node leaves the geometry unchanged', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-copy-paste-select-all-vector-edit-paste-without-copy');
    await expect(designPage.canvas).toBeVisible();

    await drawOpenTriangle(designPage);
    await designPage.selectVectorEditMoveTool();
    await designPage.click(1400, 700); // deselect, keep edit mode open
    await designPage.pointerMove(neutral.x, neutral.y);
    // wait for the layers-tree node icon's <path d> to fill in, so the baseline isn't captured
    // mid-paint (see the "Copy alone" test above)
    await expect(page.locator('span[class*="TreeItem__icon"] path[d]:not([d=""])')).toBeAttached();
    const baseline = await designPage.canvas.screenshot();

    await page.keyboard.press('Control+v'); // nothing was ever copied on this fresh page
    await designPage.pointerMove(neutral.x, neutral.y);
    const afterPaste = await designPage.canvas.screenshot();

    expect(afterPaste.equals(baseline)).toBe(true);
  });

  test('Copy then Paste while editing appends a duplicated, offset copy of the selected segment to the same node', async ({ page }) => {
    const designPage = new DesignPage(page);
    // spans the pasted copy's v1-v2 edge, (910,310) to (1060,310) — well clear of the original at y=300
    const region = { height: 40, width: 200, x: 880, y: 290 };

    await designPage.goto('e2e-test-copy-paste-select-all-vector-edit-copy-paste');
    await expect(designPage.canvas).toBeVisible();

    await drawOpenTriangle(designPage);
    await designPage.selectVectorEditMoveTool();
    await designPage.click(940, 300); // select the v1-v2 segment

    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await designPage.pointerMove(neutral.x, neutral.y);
    const withPaste = await page.screenshot({ clip: region });

    await designPage.goto('e2e-test-copy-paste-select-all-vector-edit-copy-paste-reference');
    await expect(designPage.canvas).toBeVisible();

    await drawOpenTriangle(designPage);
    await designPage.selectVectorEditMoveTool();
    await designPage.click(940, 300); // same selection, no copy/paste

    await designPage.pointerMove(neutral.x, neutral.y);
    const withoutPaste = await page.screenshot({ clip: region });

    expect(withPaste.equals(withoutPaste)).toBe(false);
  });
});
