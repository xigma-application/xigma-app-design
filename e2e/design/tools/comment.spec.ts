import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('clicking the canvas with the Comment tool opens a focused draft input at the click position', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-comment-open-draft');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('comment');
  await designPage.click(700, 300);

  const draftInput = page.locator('[class*="CommentDraftInput__input"]');

  await expect(draftInput).toBeVisible();
  await expect(draftInput).toBeFocused();
});

test('typing a comment and submitting with Control+Enter creates a pin and closes the draft', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-comment-submit');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('comment');
  await designPage.click(700, 300);
  await page.locator('[class*="CommentDraftInput__input"]').click();
  await page.keyboard.type('hello from e2e');
  await page.keyboard.press('Control+Enter');

  await expect(page.locator('[class*="CommentDraftInput"]').first()).toBeHidden();
  await expect(page.locator('[class*="CommentPin__icon-wrapper"]')).toBeVisible();
});

test('clicking away from an empty draft dismisses it without creating a pin', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-comment-dismiss-empty');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('comment');
  await designPage.click(700, 300);

  await expect(page.locator('[class*="CommentDraftInput"]').first()).toBeVisible();

  await designPage.click(1300, 700);

  await expect(page.locator('[class*="CommentDraftInput"]').first()).toBeHidden();
  await expect(page.locator('[class*="CommentPin__icon-wrapper"]')).toHaveCount(0);
});

test('clicking away from a non-empty draft wiggles it once, then dismisses it on a second outside click', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-comment-wiggle-then-dismiss');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('comment');
  await designPage.click(700, 300);
  await page.locator('[class*="CommentDraftInput__input"]').click();
  await page.keyboard.type('hello from e2e');

  const draftInput = page.locator('[class*="CommentDraftInput"]').first();

  // first outside click: value is non-empty, so it should just wiggle and stay open
  await designPage.click(1300, 700);
  await expect(draftInput).toBeVisible();

  // second outside click: now it should actually dismiss
  await designPage.click(1300, 700);
  await expect(draftInput).toBeHidden();
  await expect(page.locator('[class*="CommentPin__icon-wrapper"]')).toHaveCount(0);
});

test('panning with the middle mouse button does not dismiss an open comment draft', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-comment-survives-pan');
  await expect(designPage.canvas).toBeVisible();

  await designPage.selectTool('comment');
  await designPage.click(700, 300);

  const draftInput = page.locator('[class*="CommentDraftInput"]').first();

  await expect(draftInput).toBeVisible();

  await designPage.panBy(150, 90);

  await expect(draftInput).toBeVisible();
});
