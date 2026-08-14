import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('draws a path with the Text on Path tool and commits a rendered curved text node', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-create');
  await expect(designPage.canvas).toBeVisible();

  const before = await designPage.canvas.screenshot();

  await designPage.drawTextOnPath(300, 300, 450, 420);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  await designPage.typeText('Hello');
  await designPage.click(900, 600); // click away to commit

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('typing tool-shortcut letters while editing text on a path does not switch the active tool', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-shortcut-block');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(300, 300, 450, 420);

  // each of these letters is a tool shortcut (r=rectangle, f=frame, o=ellipse, l=line, t=text, h=hand, ...)
  await designPage.typeText('rt frame line oval hand');

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');
});

test('resizing the source path node updates the attached text live, since they are bound by pathId', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-resize');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(300, 300, 450, 420);
  await designPage.typeText('HI');
  await designPage.click(900, 600); // click away to commit, deselecting

  await designPage.click(300, 300); // the box's own "nw" corner sits outside the inscribed curve, hits the path node
  const beforeResize = await designPage.canvas.screenshot();

  await designPage.pointerDown(300, 300); // "nw" resize handle
  await designPage.pointerMove(200, 200); // enlarge the path
  await designPage.pointerUp();

  const afterResize = await designPage.canvas.screenshot();
  expect(afterResize.equals(beforeResize)).toBe(false);
});

test('the path outline stays hidden until hovered or selected, and hovering an already-selected path outranks its thin selected style', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-outline-states');
  await expect(designPage.canvas).toBeVisible();

  // a 200x200 circle centered at (400, 400); pathStartOffset defaults to 0, so "Hi" starts at
  // the circle's rightmost point, (500, 400)
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');
  await designPage.click(900, 600); // click away to commit

  await designPage.pointerMove(310, 310); // inside the bounding box, but off the curve entirely
  const hiddenBaseline = await designPage.canvas.screenshot();

  await designPage.pointerMove(500, 400); // directly on the rendered "H"
  const hovered = await designPage.canvas.screenshot();
  expect(hovered.equals(hiddenBaseline)).toBe(false);

  await designPage.pointerMove(310, 310); // move back off the curve
  const afterLeaving = await designPage.canvas.screenshot();
  expect(afterLeaving.equals(hiddenBaseline)).toBe(true);

  await designPage.click(500, 400); // select it via a real click on the rendered glyph
  await designPage.pointerMove(310, 310); // move off the text, but stay inside the box
  const selectedNotHovered = await designPage.canvas.screenshot();
  expect(selectedNotHovered.equals(hiddenBaseline)).toBe(false);

  await designPage.pointerMove(500, 400); // hover the text again, while still selected
  const selectedAndHovered = await designPage.canvas.screenshot();
  expect(selectedAndHovered.equals(selectedNotHovered)).toBe(false);
});
