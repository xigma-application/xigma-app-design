import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('dragging a group by clicking any of its children moves every child together, as one rigid body', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-rigid-move');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], auto-selected

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;
    const { childIds } = page.nodes[groupId];

    return { group: page.nodes[groupId], groupId, nodeA: page.nodes[childIds[0]], nodeB: page.nodes[childIds[1]] };
  });

  // drag from A's own area — a plain click there hits the whole group, so this moves both children;
  // start off A's dead centre so the drag misses the Smart Selection swap handle sitting there
  await designPage.pointerDown(708, 108);
  await page.mouse.move(708 + 150, 108 + 60, { steps: 10 });
  await designPage.pointerUp();

  const after = await page.evaluate(
    async ({ groupId, idA, idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], nodeA: page.nodes[idA], nodeB: page.nodes[idB] };
    },
    { groupId: before.groupId, idA: before.nodeA.id, idB: before.nodeB.id },
  );

  // both children moved by the exact same delta, and the group's own box moved with them,
  // keeping its size unchanged — this is the rigid-body move, distinct from moving one child alone
  expect(after.nodeA.x).toBeCloseTo(before.nodeA.x + 150, 0);
  expect(after.nodeA.y).toBeCloseTo(before.nodeA.y + 60, 0);
  expect(after.nodeB.x).toBeCloseTo(before.nodeB.x + 150, 0);
  expect(after.nodeB.y).toBeCloseTo(before.nodeB.y + 60, 0);
  expect(after.group.x).toBeCloseTo(before.group.x + 150, 0);
  expect(after.group.y).toBeCloseTo(before.group.y + 60, 0);
  expect(after.group.width).toBeCloseTo(before.group.width, 0);
  expect(after.group.height).toBeCloseTo(before.group.height, 0);
});

test('a plain click on a group child selects the whole group, and Ctrl+click on the same spot bypasses it to select just that child', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-plain-vs-ctrl-click');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A — auto-selected on creation
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back to the selection alongside B
  await page.keyboard.press('Control+g'); // group = [A, B]

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });
  const [idA] = before.childIds;

  await designPage.click(1500, 600); // deselect everything

  // A's body, off its dead centre so the click clears the Smart Selection swap handle there
  await designPage.click(708, 108); // plain click on A's own area

  const plainClickSelection = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(plainClickSelection).toEqual([before.groupId]);

  await designPage.click(708, 108, { ctrl: true }); // Ctrl+click the same spot

  const ctrlClickSelection = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(ctrlClickSelection).toEqual([idA]);
});

test('Ctrl+Shift+click toggles a group child in and out of the selection, ignoring the group entirely', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-ctrl-shift-toggle');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A — auto-selected on creation
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back to the selection alongside B
  await page.keyboard.press('Control+g'); // group = [A, B]

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });
  const [idA, idB] = before.childIds;

  await designPage.click(1500, 600); // deselect everything

  await designPage.click(708, 108, { ctrl: true, shift: true }); // toggle A in

  const afterFirstToggle = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(afterFirstToggle).toEqual([idA]);

  await designPage.click(908, 108, { ctrl: true, shift: true }); // toggle B in too, alongside A

  const afterSecondToggle = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(afterSecondToggle).toEqual([idA, idB]);

  await designPage.click(708, 108, { ctrl: true, shift: true }); // toggle A back out

  const afterThirdToggle = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(afterThirdToggle).toEqual([idB]);
});

test('dragging a group child together with an unrelated top-level node keeps the group’s own box synced to the child’s new position', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-mixed-selection-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B]

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { childIds: page.nodes[groupId].childIds as string[], group: page.nodes[groupId], groupId };
  });
  const [idA, idB] = before.childIds;

  await designPage.drawRectangle(700, 300, 740, 340); // C — auto-selected, outside the group

  await designPage.click(920, 120, { ctrl: true }); // Ctrl+click B directly, bypassing the group
  await designPage.click(720, 320, { shift: true }); // add C, selection = [B, C]

  // drag from B's own area by +200 in x, moving B and C together
  await designPage.pointerDown(920, 120);
  await page.mouse.move(1120, 120, { steps: 10 });
  await designPage.pointerUp();

  const after = await page.evaluate(
    async ({ groupId, idA, idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], nodeA: page.nodes[idA], nodeB: page.nodes[idB] };
    },
    { groupId: before.groupId, idA, idB },
  );

  // B really moved, A stayed put
  expect(after.nodeB.x).toBeCloseTo(before.group.x + 400, 0);
  expect(after.nodeA.x).toBeCloseTo(before.group.x, 0);

  // the group's own box grew to keep tightly wrapping A (unmoved) and B (at its new position) —
  // it must not have frozen at its pre-drag size, nor at some other stale value
  expect(after.group.x).toBeCloseTo(before.group.x, 0);
  expect(after.group.width).toBeCloseTo(after.nodeB.x + 40 - before.group.x, 0);
  expect(after.group.height).toBeCloseTo(before.group.height, 0);
});

test('after rotating a group, dragging one child out of it on its own resyncs the group’s box to still fully contain both children', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-rotated-child-resync');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(830, 100, 870, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B]

  const grouped = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { childIds: page.nodes[groupId].childIds as string[], group: page.nodes[groupId], groupId };
  });
  const [idA, idB] = grouped.childIds;

  // rotate the group as a rigid body: the rotate ring is a thin annulus around each corner handle,
  // from CORNER_HANDLE_SIZE (6px) out to ROTATE_HANDLE_OUTER_RADIUS_PX (16px) — start well inside
  // that band (~11px out, diagonally) from the top-right corner
  await designPage.pointerDown(grouped.group.x + grouped.group.width + 8, grouped.group.y - 8);
  await page.mouse.move(grouped.group.x + grouped.group.width + 8, grouped.group.y - 60, { steps: 10 });
  await designPage.pointerUp();

  const rotated = await page.evaluate(
    async ({ groupId }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].nodes[groupId];
    },
    { groupId: grouped.groupId },
  );

  expect(rotated.rotation).not.toBe(0);

  await designPage.click(1500, 700); // deselect

  // B's own x/y are still absolute world coordinates, so its center point (invariant under rotation)
  // is the reliable screen spot to click it at, whatever the group's rotation happened to land on
  const bCenter = await page.evaluate(
    async ({ idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const node = pages[activePageId].nodes[idB];

      return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    },
    { idB },
  );

  // Ctrl+click B directly (bypassing the now-rotated group) and drag it on its own — this breaks
  // the rigid body, which is exactly the scenario that used to leave the group's box stale
  await designPage.click(bCenter.x, bCenter.y, { ctrl: true });
  await designPage.pointerDown(bCenter.x, bCenter.y);
  await page.mouse.move(bCenter.x, bCenter.y + 280, { steps: 10 });
  await designPage.pointerUp();

  const after = await page.evaluate(
    async ({ groupId, idA, idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], nodeA: page.nodes[idA], nodeB: page.nodes[idB] };
    },
    { groupId: grouped.groupId, idA, idB },
  );

  // the box must have actually changed from its pre-drag (now stale) rotated size/position...
  expect(after.group).not.toMatchObject({
    height: rotated.height,
    width: rotated.width,
    x: rotated.x,
    y: rotated.y,
  });

  // ...and, rotated back into world space, it must still fully contain both children
  const center = { x: after.group.x + after.group.width / 2, y: after.group.y + after.group.height / 2 };
  const radians = (after.group.rotation * Math.PI) / 180;
  const corners = [
    { x: after.group.x, y: after.group.y },
    { x: after.group.x + after.group.width, y: after.group.y },
    { x: after.group.x + after.group.width, y: after.group.y + after.group.height },
    { x: after.group.x, y: after.group.y + after.group.height },
  ];
  const worldXs = corners.map((c) => center.x + (c.x - center.x) * Math.cos(radians) - (c.y - center.y) * Math.sin(radians));
  const worldYs = corners.map((c) => center.y + (c.x - center.x) * Math.sin(radians) + (c.y - center.y) * Math.cos(radians));

  expect(Math.min(...worldXs)).toBeLessThanOrEqual(after.nodeA.x + 1);
  expect(Math.min(...worldYs)).toBeLessThanOrEqual(Math.min(after.nodeA.y, after.nodeB.y) + 1);
  expect(Math.max(...worldXs)).toBeGreaterThanOrEqual(after.nodeB.x + 40 - 1);
  expect(Math.max(...worldYs)).toBeGreaterThanOrEqual(Math.max(after.nodeA.y, after.nodeB.y) + 40 - 1);
});

test('resizing a group from its corner handle scales every child’s geometry proportionally', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-resize-scales-children');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], auto-selected

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;
    const { childIds } = page.nodes[groupId];

    return { group: page.nodes[groupId], groupId, nodeA: page.nodes[childIds[0]], nodeB: page.nodes[childIds[1]] };
  });

  // drag the bottom-right corner handle purely horizontally, doubling the width while leaving
  // height untouched — the anchor (top-left, at group.x) stays fixed
  const handleX = before.group.x + before.group.width;
  const handleY = before.group.y + before.group.height;

  await designPage.pointerDown(handleX, handleY);
  await page.mouse.move(handleX + before.group.width, handleY, { steps: 10 });
  await designPage.pointerUp();

  const after = await page.evaluate(
    async ({ groupId, idA, idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], nodeA: page.nodes[idA], nodeB: page.nodes[idB] };
    },
    { groupId: before.groupId, idA: before.nodeA.id, idB: before.nodeB.id },
  );

  // width doubled, anchored at the original left edge; height untouched
  expect(after.group.x).toBeCloseTo(before.group.x, 0);
  expect(after.group.width).toBeCloseTo(before.group.width * 2, 0);
  expect(after.group.height).toBeCloseTo(before.group.height, 0);

  // each child's own x offset from the anchor doubled too, and so did its own width — pure
  // geometry scaling, not a rigid translate
  const scaleX = after.group.width / before.group.width;

  expect(after.nodeA.x).toBeCloseTo(before.group.x + (before.nodeA.x - before.group.x) * scaleX, 0);
  expect(after.nodeA.width).toBeCloseTo(before.nodeA.width * scaleX, 0);
  expect(after.nodeB.x).toBeCloseTo(before.group.x + (before.nodeB.x - before.group.x) * scaleX, 0);
  expect(after.nodeB.width).toBeCloseTo(before.nodeB.width * scaleX, 0);
  expect(after.nodeA.height).toBeCloseTo(before.nodeA.height, 0);
  expect(after.nodeB.height).toBeCloseTo(before.nodeB.height, 0);
});

test('rotating a group turns every child together, around the group’s own center, as one rigid body', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-rigid-rotate');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], auto-selected

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;
    const { childIds } = page.nodes[groupId];

    return { group: page.nodes[groupId], groupId, nodeA: page.nodes[childIds[0]], nodeB: page.nodes[childIds[1]] };
  });

  // rotate the group as a rigid body — same thin ring technique as the resync test above
  await designPage.pointerDown(before.group.x + before.group.width + 8, before.group.y - 8);
  await page.mouse.move(before.group.x + before.group.width + 8, before.group.y - 60, { steps: 10 });
  await designPage.pointerUp();

  const after = await page.evaluate(
    async ({ groupId, idA, idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], nodeA: page.nodes[idA], nodeB: page.nodes[idB] };
    },
    { groupId: before.groupId, idA: before.nodeA.id, idB: before.nodeB.id },
  );

  expect(after.group.rotation).not.toBe(0);
  // the group's own box stayed the same size, only its rotation changed — a rigid turn, not a resize
  expect(after.group.width).toBeCloseTo(before.group.width, 0);
  expect(after.group.height).toBeCloseTo(before.group.height, 0);

  // rotating each child's new world position back by the group's own rotation, around the group's
  // original center, must land back on that child's original (pre-rotation) position
  const center = { x: before.group.x + before.group.width / 2, y: before.group.y + before.group.height / 2 };
  const radians = (-after.group.rotation * Math.PI) / 180;
  const derotate = (point: { x: number; y: number }): { x: number; y: number } => ({
    x: center.x + (point.x - center.x) * Math.cos(radians) - (point.y - center.y) * Math.sin(radians),
    y: center.y + (point.x - center.x) * Math.sin(radians) + (point.y - center.y) * Math.cos(radians),
  });

  const derotatedA = derotate({ x: after.nodeA.x + after.nodeA.width / 2, y: after.nodeA.y + after.nodeA.height / 2 });
  const derotatedB = derotate({ x: after.nodeB.x + after.nodeB.width / 2, y: after.nodeB.y + after.nodeB.height / 2 });

  expect(derotatedA.x).toBeCloseTo(before.nodeA.x + before.nodeA.width / 2, 0);
  expect(derotatedA.y).toBeCloseTo(before.nodeA.y + before.nodeA.height / 2, 0);
  expect(derotatedB.x).toBeCloseTo(before.nodeB.x + before.nodeB.width / 2, 0);
  expect(derotatedB.y).toBeCloseTo(before.nodeB.y + before.nodeB.height / 2, 0);
});

test('deleting one individual child of a group shrinks it to the rest, and deleting the last remaining child removes the now-empty group too', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-delete-single-child');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], auto-selected

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;
    const { childIds } = page.nodes[groupId];

    return { group: page.nodes[groupId], groupId, nodeA: page.nodes[childIds[0]], nodeB: page.nodes[childIds[1]] };
  });

  // Ctrl+click B individually (bypassing the group) and delete just it
  await designPage.click(908, 108, { ctrl: true });
  await page.keyboard.press('Delete');

  const afterFirstDelete = await page.evaluate(
    async ({ groupId, idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], hasB: Boolean(page.nodes[idB]) };
    },
    { groupId: before.groupId, idB: before.nodeB.id },
  );

  expect(afterFirstDelete.hasB).toBe(false); // B itself is gone
  expect(afterFirstDelete.group).toBeDefined(); // the group survives with its one remaining child
  expect(afterFirstDelete.group.childIds).toEqual([before.nodeA.id]);
  // the group's own box shrank to tightly wrap just A now
  expect(afterFirstDelete.group.x).toBeCloseTo(before.nodeA.x, 0);
  expect(afterFirstDelete.group.width).toBeCloseTo(before.nodeA.width, 0);

  // now delete A too, the group's last remaining child
  await designPage.click(708, 108, { ctrl: true });
  await page.keyboard.press('Delete');

  const afterSecondDelete = await page.evaluate(
    async ({ groupId, idA }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], hasA: Boolean(page.nodes[idA]), rootOrder: page.rootOrder };
    },
    { groupId: before.groupId, idA: before.nodeA.id },
  );

  expect(afterSecondDelete.hasA).toBe(false); // A is gone too
  expect(afterSecondDelete.group).toBeUndefined(); // the now-empty group was cleaned up on its own
  expect(afterSecondDelete.rootOrder).toEqual([]);
});

test('undoing an individual child’s rigid-body-breaking move restores the group’s own box to its pre-drag state', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-undo-child-move');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], auto-selected

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;
    const { childIds } = page.nodes[groupId];

    return { group: page.nodes[groupId], groupId, nodeB: page.nodes[childIds[1]] };
  });

  // Ctrl+click B and drag it on its own, breaking the rigid body and growing the group's box;
  // aim off B's dead centre so the Ctrl+click and drag clear the Smart Selection swap handle there
  await designPage.click(908, 108, { ctrl: true });
  await designPage.pointerDown(908, 108);
  await page.mouse.move(1208, 108, { steps: 10 });
  await designPage.pointerUp();

  const afterDrag = await page.evaluate(
    async ({ groupId }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].nodes[groupId];
    },
    { groupId: before.groupId },
  );

  expect(afterDrag.width).not.toBeCloseTo(before.group.width, 0); // sanity: the box really did grow

  await page.keyboard.press('Control+z');

  const afterUndo = await page.evaluate(
    async ({ groupId, idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], nodeB: page.nodes[idB] };
    },
    { groupId: before.groupId, idB: before.nodeB.id },
  );

  // both the moved child and the group's own box are back to their exact pre-drag values
  expect(afterUndo.nodeB.x).toBeCloseTo(before.nodeB.x, 0);
  expect(afterUndo.group.x).toBeCloseTo(before.group.x, 0);
  expect(afterUndo.group.width).toBeCloseTo(before.group.width, 0);
});

test('resizing a mixed selection of a group child and an unrelated top-level node scales both together as one combined transform', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-mixed-selection-resize');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B]

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;
    const { childIds } = page.nodes[groupId];

    return { groupId, nodeB: page.nodes[childIds[1]] };
  });

  await designPage.drawRectangle(900, 300, 940, 340); // C — directly below B, auto-selected

  const before2 = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [cId] = page.selectedIds;

    return { cId, nodeC: page.nodes[cId] };
  });

  await designPage.click(920, 120, { ctrl: true }); // Ctrl+click B directly, bypassing the group
  await designPage.click(920, 320, { shift: true }); // add C, selection = [B, C]

  // drag the combined selection's bottom-right corner (B ∪ C, both at x900-940) purely vertically,
  // doubling the combined height while the top edge (y=100, B's own top) stays the anchor
  await designPage.pointerDown(940, 340);
  await page.mouse.move(940, 580, { steps: 10 });
  await designPage.pointerUp();

  const after = await page.evaluate(
    async ({ idB, idC }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { nodeB: page.nodes[idB], nodeC: page.nodes[idC] };
    },
    { idB: before.nodeB.id, idC: before2.cId },
  );

  // B, anchored right at the top edge, keeps its y but doubles its own height
  expect(after.nodeB.y).toBeCloseTo(before.nodeB.y, 0);
  expect(after.nodeB.height).toBeCloseTo(before.nodeB.height * 2, 0);
  // C's offset from the anchor doubled too, and so did its own height — the same uniform scale,
  // proving the mixed-parent selection resized as ONE combined transform, not two independent ones
  const anchorY = before.nodeB.y;
  const expectedCY = anchorY + (before2.nodeC.y - anchorY) * 2;

  expect(after.nodeC.y).toBeCloseTo(expectedCY, 0);
  expect(after.nodeC.height).toBeCloseTo(before2.nodeC.height * 2, 0);
});

test('once a group child and an unrelated node are both selected, starting the drag from the empty gap between them still moves both together', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-mixed-selection-empty-gap-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B]

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;
    const { childIds } = page.nodes[groupId];

    return { nodeB: page.nodes[childIds[1]] };
  });

  await designPage.drawRectangle(900, 300, 940, 340); // C — directly below B, auto-selected

  const cId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds[0];
  });

  await designPage.click(908, 108, { ctrl: true }); // Ctrl+click B directly, bypassing the group
  await designPage.click(908, 308, { shift: true }); // add C, selection = [B, C]

  // B ∪ C's combined bounds span x900-940, y100-340 — (908, 175) sits in the empty gap between
  // them but still inside that combined box, and clear of the Smart Selection gap handle at the
  // gap's exact midpoint; starting a drag there is only a rigid-multi-transform continuation (not a
  // fresh hit-test) once the mixed-parent selection is recognized as one unit
  await designPage.pointerDown(908, 175);
  await page.mouse.move(908 + 100, 175, { steps: 10 });
  await designPage.pointerUp();

  const after = await page.evaluate(
    async ({ idB, idC }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { nodeB: page.nodes[idB], nodeC: page.nodes[idC] };
    },
    { idB: before.nodeB.id, idC: cId },
  );

  expect(after.nodeB.x).toBeCloseTo(before.nodeB.x + 100, 0);
  expect(after.nodeC.x).toBeCloseTo(900 + 100, 0);
});

test('a marquee that only touches one child of a group selects the whole group, not just that child', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-marquee-touches-one-child');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B]

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds[0];
  });

  await designPage.click(1500, 600); // deselect

  // marquee (touch mode, no modifier) only sweeps across A's own area — nowhere near B
  await designPage.pointerDown(680, 80);
  await designPage.pointerMove(760, 160);
  await designPage.pointerUp();

  const selectedIds = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(selectedIds).toEqual([before]);
});

test('deleting one child of a rotated group shrinks the group’s box to tightly wrap only the remaining child', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-delete-child-from-rotated-group');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], auto-selected

  const grouped = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;
    const { childIds } = page.nodes[groupId];

    return { group: page.nodes[groupId], groupId, nodeA: page.nodes[childIds[0]], nodeB: page.nodes[childIds[1]] };
  });

  // rotate the group as a rigid body — same thin-ring technique as the other rotate tests
  await designPage.pointerDown(grouped.group.x + grouped.group.width + 8, grouped.group.y - 8);
  await page.mouse.move(grouped.group.x + grouped.group.width + 8, grouped.group.y - 60, { steps: 10 });
  await designPage.pointerUp();

  const rotated = await page.evaluate(
    async ({ groupId }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].nodes[groupId];
    },
    { groupId: grouped.groupId },
  );

  expect(rotated.rotation).not.toBe(0);

  await designPage.click(1500, 700); // deselect

  // B's own x/y are still absolute world coordinates and invariant under rotation at its own
  // center, so its center point is the reliable screen spot to Ctrl+click it at post-rotation
  const bCenter = await page.evaluate(
    async ({ idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const node = pages[activePageId].nodes[idB];

      return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    },
    { idB: grouped.nodeB.id },
  );

  // Ctrl+click B directly (bypassing the rotated group) and delete just it
  await designPage.click(bCenter.x, bCenter.y, { ctrl: true });
  await page.keyboard.press('Delete');

  const after = await page.evaluate(
    async ({ groupId, idA, idB }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const page = pages[activePageId];

      return { group: page.nodes[groupId], hasB: Boolean(page.nodes[idB]), nodeA: page.nodes[idA] };
    },
    { groupId: grouped.groupId, idA: grouped.nodeA.id, idB: grouped.nodeB.id },
  );

  expect(after.hasB).toBe(false); // B itself is gone
  expect(after.group.childIds).toEqual([grouped.nodeA.id]); // group shrunk to just A

  // the box must have actually changed from its pre-delete (now stale, sized for both children) box
  expect(after.group).not.toMatchObject({
    height: rotated.height,
    width: rotated.width,
    x: rotated.x,
    y: rotated.y,
  });

  // and, rotated back into world space, it must now tightly wrap just A — not still be sized to
  // also cover where B used to be
  const center = { x: after.group.x + after.group.width / 2, y: after.group.y + after.group.height / 2 };
  const radians = (after.group.rotation * Math.PI) / 180;
  const corners = [
    { x: after.group.x, y: after.group.y },
    { x: after.group.x + after.group.width, y: after.group.y },
    { x: after.group.x + after.group.width, y: after.group.y + after.group.height },
    { x: after.group.x, y: after.group.y + after.group.height },
  ];
  const worldXs = corners.map((c) => center.x + (c.x - center.x) * Math.cos(radians) - (c.y - center.y) * Math.sin(radians));
  const worldYs = corners.map((c) => center.y + (c.x - center.x) * Math.sin(radians) + (c.y - center.y) * Math.cos(radians));

  // fully contains A...
  expect(Math.min(...worldXs)).toBeLessThanOrEqual(after.nodeA.x + 1);
  expect(Math.min(...worldYs)).toBeLessThanOrEqual(after.nodeA.y + 1);
  expect(Math.max(...worldXs)).toBeGreaterThanOrEqual(after.nodeA.x + after.nodeA.width - 1);
  expect(Math.max(...worldYs)).toBeGreaterThanOrEqual(after.nodeA.y + after.nodeA.height - 1);

  // ...tightly, not loosely — the box's own area should now be close to A's own area, not still
  // inflated to cover the deleted B as well
  expect(after.group.width * after.group.height).toBeLessThan(rotated.width * rotated.height * 0.6);
});

test("resizing a rotated group from an edge handle keeps the untouched axis of the group's own box rock steady, not jittering frame to frame", async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-nodes-rotated-resize-no-jitter');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 780, 340); // A
  await designPage.drawRectangle(820, 300, 900, 340); // B — auto-selected, replacing A's selection
  await designPage.click(740, 320, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], auto-selected

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { group: page.nodes[groupId], groupId };
  });

  // rotate the group as a rigid body — same thin-ring technique as the sibling rotate test
  await designPage.pointerDown(before.group.x + before.group.width + 8, before.group.y - 8);
  await page.mouse.move(before.group.x + before.group.width + 8, before.group.y - 60, { steps: 10 });
  await designPage.pointerUp();

  const rotated = await page.evaluate(
    async ({ groupId }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].nodes[groupId];
    },
    { groupId: before.groupId },
  );

  expect(rotated.rotation).not.toBe(0);

  // the "e" (right-edge, horizontal-only) handle sits at the rotated box's own local (x+width, midY)
  const handle = await page.evaluate(
    async ({ groupId }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const group = pages[activePageId].nodes[groupId];
      const cx = group.x + group.width / 2;
      const cy = group.y + group.height / 2;
      const rad = (group.rotation * Math.PI) / 180;
      const localX = group.x + group.width;

      return { x: cx + (localX - cx) * Math.cos(rad), y: cy + (localX - cx) * Math.sin(rad) };
    },
    { groupId: before.groupId },
  );

  await designPage.pointerDown(handle.x, handle.y);

  const heights: number[] = [];

  for (let step = 1; step <= 15; step++) {
    await designPage.pointerMove(handle.x + (step * 120) / 15, handle.y);

    const height = await page.evaluate(
      async ({ groupId }) => {
        const { store } = await import('/src/store/index.ts');
        const { activePageId, pages } = store.getState().design;

        return pages[activePageId].nodes[groupId].height;
      },
      { groupId: before.groupId },
    );

    heights.push(height);
  }

  await designPage.pointerUp();

  // dragging the "e" handle only ever scales width — the height axis is untouched (anchor.y is
  // null for this handle) and must stay pinned to the pre-drag value on every single frame. Before
  // the fix, each child's resize dispatch ran syncGroupBounds, which recomputed the group's own box
  // as an approximate AABB over the children's now-rounded corners — fighting the exact box already
  // set for it that same frame and making this height visibly jitter step to step instead of holding still.
  heights.forEach((height) => expect(height).toBeCloseTo(rotated.height, 0));
  expect(new Set(heights).size).toBe(1);
});
