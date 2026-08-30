import { test, expect, Locator } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

test('Ctrl+G groups two selected rectangles into a single group node', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-two-rectangles');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A — auto-selected on creation
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return { rootOrder: pages[activePageId].rootOrder, selectedIds: pages[activePageId].selectedIds };
  });

  expect(before.rootOrder).toHaveLength(2);
  const [idA, idB] = before.rootOrder;

  await designPage.click(720, 120, { shift: true }); // add A back to the selection alongside B

  await page.keyboard.press('Control+g');

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { group: page.nodes[groupId], groupId, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  expect(after.rootOrder).toEqual([after.groupId]);
  expect(after.selectedIds).toEqual([after.groupId]);
  expect(after.group.type).toBe('group');
  expect([...after.group.childIds].sort()).toEqual([idA, idB].sort());
});

test('Ctrl+Shift+G ungroups a group node, restoring its two children to the top level', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-ungroup-two-rectangles');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A — auto-selected on creation
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back to the selection alongside B
  await page.keyboard.press('Control+g');

  const grouped = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });

  await page.keyboard.press('Control+Shift+g');

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  expect(after.nodes[grouped.groupId]).toBeUndefined(); // the group node itself is gone
  expect([...after.rootOrder].sort()).toEqual([...grouped.childIds].sort()); // both children back at the top level
  expect([...after.selectedIds].sort()).toEqual([...grouped.childIds].sort()); // and left selected

  for (const childId of grouped.childIds) {
    expect(after.nodes[childId].parentId).toBeNull();
  }
});

test('grouping a node stolen from an existing group (outsider selected first) forms a new group at the outsider’s slot and shrinks the old group', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-steal-from-existing-group');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // old group = [A, B]

  const oldGroup = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });
  const [idA, idB] = oldGroup.childIds;

  await designPage.drawRectangle(700, 300, 740, 340); // C — auto-selected, outside the old group

  // Ctrl+click reaches directly into the old group to hit B specifically (a plain click on that
  // spot would otherwise select the whole old group, per getGroupChildHitAtPoint's "Ctrl drills in"
  // convention); Shift adds it to C's current selection instead of replacing it — final selection
  // order is [C, B], C (the outsider) selected first, matching the reported scenario
  await designPage.click(920, 120, { ctrl: true, shift: true });

  await page.keyboard.press('Control+g');

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  const [newGroupId] = after.selectedIds;

  // B was stolen out of the old group into the new one; the old group shrinks to just A
  expect(after.nodes[oldGroup.groupId].childIds).toEqual([idA]);
  expect(after.nodes[newGroupId].childIds.length).toBe(2);
  expect(after.nodes[newGroupId].childIds).toContain(idB);
  expect(after.nodes[idB].parentId).toBe(newGroupId);
  expect(after.nodes[idA].parentId).toBe(oldGroup.groupId); // A is untouched
  expect([...after.rootOrder].sort()).toEqual([oldGroup.groupId, newGroupId].sort());
  expect(after.selectedIds).toEqual([newGroupId]);
});

test('grouping an existing group member with an outsider (member selected first) nests the new group inside the old one, in place', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-member-selected-first');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // old group = [A, B]

  const oldGroup = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });
  const [idA, idB] = oldGroup.childIds;

  await designPage.drawRectangle(700, 300, 740, 340); // C — auto-selected, outside the old group

  // Ctrl+click B (the existing group member) first, replacing the selection entirely (no Shift) —
  // this is the "member selected first" half of the scenario
  await designPage.click(920, 120, { ctrl: true });
  // then Shift-click C (the outsider) to add it — final selection order [B, C], the member first
  await designPage.click(720, 320, { shift: true });

  await page.keyboard.press('Control+g');

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  const [newGroupId] = after.selectedIds;

  // the new group forms INSIDE the old group, replacing B's own slot, and steals C in from the top
  // level to join it — A is left untouched as the old group's other child
  expect(after.rootOrder).toEqual([oldGroup.groupId]); // C is gone from the top level entirely
  expect(after.nodes[oldGroup.groupId].childIds).toEqual([idA, newGroupId]);
  expect(after.nodes[newGroupId].childIds.length).toBe(2);
  expect(after.nodes[newGroupId].childIds).toContain(idB);
  expect(after.nodes[newGroupId].parentId).toBe(oldGroup.groupId);
  expect(after.nodes[idB].parentId).toBe(newGroupId);
  expect(after.nodes[idA].parentId).toBe(oldGroup.groupId); // A is untouched
  expect(after.selectedIds).toEqual([newGroupId]);
});

test('dragging a group child out in the Layers panel moves it back to the top level, shrinking the group', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-drag-child-out-in-layers-panel');
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

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });
  const [firstChildId] = before.childIds;

  // The Layers panel is expanded by default, but the group row itself starts collapsed — reveal its
  // two children before attempting to drag one of them
  await page.getByRole('button', { name: 'Expand layer' }).click();

  // PagesList renders the exact same shared Tree component (and thus the exact same "Tree__row"/
  // "Tree__rows" CSS Modules classes) above the Layers section on this same page — scope every row
  // lookup to the LayersTree's own wrapper so this doesn't accidentally grab Pages' rows/container.
  // "Tree__row_" (with the trailing underscore CSS Modules inserts before the hash) also deliberately
  // excludes the "Tree__rows_" scroll container, which a plain "Tree__row" substring match would
  // otherwise also pick up as a spurious extra row at index 0.
  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');
  const rowsContainer = layersTree.locator('[class*="Tree__rows"]');

  // wait for the group row + its two now-revealed children to actually be in the DOM before reading
  // any bounding boxes off them — reading immediately after the expand click risks a stale layout
  // from before the virtualizer re-measured the newly-expanded row count
  await expect(rows).toHaveCount(3);

  const startBox = await rows.nth(1).boundingBox(); // depth-1 row for the group's first child
  const lastRowBox = await rows.nth(2).boundingBox();
  const containerBox = await rowsContainer.boundingBox();

  if (!startBox || !lastRowBox || !containerBox) {
    throw new Error('Layers tree rows not found');
  }

  // drag the first child row down past the last row, landing at the container's own left edge so
  // the drop resolves to depth 0 (top level), the same drag primitive useTreeRowDrag listens for.
  // useTreeRowDrag's mouseup listener is re-subscribed (via useEffect) on every dropDepth/insertionIndex
  // state change, so it needs a beat after the final mousemove to actually pick up a listener closure
  // bound to that final state before mouseup fires — otherwise mouseup can run against a stale
  // pre-final-move closure, silently keeping the drop at the previous depth.
  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(containerBox.x + 2, lastRowBox.y + lastRowBox.height + 10, { steps: 10 });
  await page.waitForTimeout(100);
  await page.mouse.up();

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder };
  });

  expect(after.nodes[before.groupId].childIds).toEqual([before.childIds[1]]); // group shrunk to the other child
  expect(after.nodes[firstChildId].parentId).toBeNull();
  expect(after.rootOrder).toContain(firstChildId);
  expect(after.rootOrder).toContain(before.groupId);
});

test('deleting a selected group cascades to delete its children too, not just the group node itself', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-delete-cascades-to-children');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B], selected

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });

  await page.keyboard.press('Delete');

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  expect(after.nodes[before.groupId]).toBeUndefined(); // the group itself is gone
  for (const childId of before.childIds) {
    expect(after.nodes[childId]).toBeUndefined(); // and so is every one of its children
  }
  expect(after.rootOrder).toEqual([]);
  expect(after.selectedIds).toEqual([]);
});

test('clicking a 3-levels-deep nested group after selecting it in the Layers panel keeps the group selected, not one of its leaf descendants', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-click-three-levels-deep');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(760, 100, 800, 140); // B — adjacent to A, auto-selected
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group-1 = [A, B], auto-selected
  await page.keyboard.press('Control+g'); // group-2 = [group-1], auto-selected
  await page.keyboard.press('Control+g'); // group-3 = [group-2], auto-selected

  const groupId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds[0];
  });

  await designPage.click(1500, 600); // deselect everything, matching a fresh "nothing selected" start

  // reselect group-3 the same way the report described: via its own row in the Layers panel, not
  // by re-running the grouping shortcut. Only group-3's row is visible at this point — it starts
  // collapsed, so none of its (still real) descendants render as rows to collide with the text match.
  const layersTree = page.locator('[class*="LayersTree"]').first();
  await layersTree.getByText('Group', { exact: true }).click();

  // click squarely inside the group's own bounding box (A's original area) — the same gesture a user
  // makes to start dragging the selected box on canvas
  await designPage.click(720, 120);

  const selectedIds = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(selectedIds).toEqual([groupId]);
});

test('dragging a top-level rectangle into a group in the Layers panel reparents it as a new child', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-drag-child-into-group-in-layers-panel');
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

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });

  await designPage.drawRectangle(700, 300, 740, 340); // C — auto-selected, outside the group

  const cId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds[0];
  });

  // same scoping caveats as the drag-out test above: PagesList renders the identical shared Tree
  // classes, so every row lookup stays scoped to the LayersTree's own wrapper
  await page.getByRole('button', { name: 'Expand layer' }).click();

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');

  // rows are now [group(depth0), A(depth1), B(depth1), C(depth0)] — 4 total
  await expect(rows).toHaveCount(4);

  const cRowBox = await rows.nth(3).boundingBox();
  const bRowBox = await rows.nth(2).boundingBox(); // the gap right before B pins the drop depth to 1

  if (!cRowBox || !bRowBox) {
    throw new Error('Layers tree rows not found');
  }

  await page.mouse.move(cRowBox.x + cRowBox.width / 2, cRowBox.y + cRowBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(bRowBox.x + bRowBox.width / 2, bRowBox.y, { steps: 10 }); // land right at B's own top edge
  await page.waitForTimeout(100); // let useTreeRowDrag's mouseup listener resubscribe to the final drop state
  await page.mouse.up();

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder };
  });

  expect(after.nodes[before.groupId].childIds).toEqual([before.childIds[0], cId, before.childIds[1]]); // C landed between A and B
  expect(after.nodes[cId].parentId).toBe(before.groupId);
  expect(after.rootOrder).toEqual([before.groupId]); // C is gone from the top level entirely
});

test('dragging a group into its own descendant in the Layers panel is a no-op (cycle guard)', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-drag-cycle-guard');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group-inner = [A, B], auto-selected
  await page.keyboard.press('Control+g'); // group-outer = [group-inner], auto-selected

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return { nodes: pages[activePageId].nodes, rootOrder: pages[activePageId].rootOrder };
  });

  const layersTree = page.locator('[class*="LayersTree"]').first();

  // reveal group-outer's own child (group-inner), then group-inner's own children (A, B) — only one
  // "Expand layer" button is ever visible at a time, since each click reveals exactly one more level
  await page.getByRole('button', { name: 'Expand layer' }).click();
  await page.getByRole('button', { name: 'Expand layer' }).click();

  const rows = layersTree.locator('[class*="Tree__row_"]');

  // rows are now [group-outer(depth0), group-inner(depth1), A(depth2), B(depth2)] — 4 total
  await expect(rows).toHaveCount(4);

  const outerRowBox = await rows.nth(0).boundingBox();
  const bRowBox = await rows.nth(3).boundingBox(); // the gap right before B pins the drop depth to 2

  if (!outerRowBox || !bRowBox) {
    throw new Error('Layers tree rows not found');
  }

  // attempt to drag group-outer to become a child of group-inner — one of group-outer's own
  // descendants, an illegal cycle that handleMoveNodes must reject entirely
  await page.mouse.move(outerRowBox.x + outerRowBox.width / 2, outerRowBox.y + outerRowBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(bRowBox.x + bRowBox.width / 2, bRowBox.y, { steps: 10 }); // land right at B's own top edge
  await page.waitForTimeout(100); // let useTreeRowDrag's mouseup listener resubscribe to the final drop state
  await page.mouse.up();

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return { nodes: pages[activePageId].nodes, rootOrder: pages[activePageId].rootOrder };
  });

  // nothing moved — the whole structure is byte-for-byte the same as before the drag attempt
  expect(after.rootOrder).toEqual(before.rootOrder);
  expect(after.nodes).toEqual(before.nodes);
});

test('Control+Z undoes Ctrl+G as a single step, restoring the exact pre-group state', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-undo');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  await page.keyboard.press('Control+g');

  const grouped = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return { groupId: pages[activePageId].selectedIds[0] };
  });

  expect(grouped.groupId).not.toBe(undefined);

  await page.keyboard.press('Control+z');

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  // one Undo reverts the whole grouping gesture in a single step — no leftover group node, and the
  // exact pre-group rootOrder/selection/node content, not just "A and B exist again"
  expect(after.nodes[grouped.groupId]).toBeUndefined();
  expect(after.rootOrder).toEqual(before.rootOrder);
  expect(after.selectedIds).toEqual(before.selectedIds);
  expect(after.nodes).toEqual(before.nodes);
});

test('Control+Shift+Z redoes Ctrl+G after an Undo, restoring the exact same group', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-redo');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(900, 100, 940, 140); // B — auto-selected, replacing A's selection
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g');

  const grouped = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+Shift+z');

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { nodes: page.nodes, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  // redo restores the exact same snapshot Undo had just reverted — same group id, same childIds
  // order, same rootOrder/selection, not merely "a group exists again"
  expect(after).toEqual(grouped);
});

test('Ctrl+G on a single selected rectangle wraps it in a new group by itself', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-single-node');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A — auto-selected on creation

  const idA = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds[0];
  });

  await page.keyboard.press('Control+g');

  const after = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const [groupId] = page.selectedIds;

    return { group: page.nodes[groupId], groupId, rootOrder: page.rootOrder, selectedIds: page.selectedIds };
  });

  expect(after.rootOrder).toEqual([after.groupId]);
  expect(after.selectedIds).toEqual([after.groupId]);
  expect(after.group.type).toBe('group');
  expect(after.group.childIds).toEqual([idA]);
  expect(after.groupId).not.toBe(idA); // a genuinely new wrapper node, not A relabeled
});

test('hiding a group in the Layers panel cascades to hide every one of its children, making them un-clickable too', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-hide-cascades-to-children');
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

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });

  // the group row is the only one visible at this point (still collapsed), so this is unambiguous
  const layersTree = page.locator('[class*="LayersTree"]').first();
  await layersTree.locator('[data-tree-item-action="hidden"]').click();

  const after = await page.evaluate(async (before) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];

    return { group: page.nodes[before.groupId], nodeA: page.nodes[before.childIds[0]], nodeB: page.nodes[before.childIds[1]] };
  }, before);

  expect(after.group.hidden).toBe(true);
  expect(after.nodeA.hidden).toBe(true);
  expect(after.nodeB.hidden).toBe(true);

  // and hidden really does mean un-clickable: clicking where A used to render must not select it
  await designPage.click(1500, 600); // deselect everything first
  await designPage.click(720, 120); // A's own original spot

  const selectedIds = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(selectedIds).toEqual([]);
});

test('Ctrl+clicking a child then its parent group in the Layers panel selects only the group, and highlights every child without selecting them', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-child-then-parent-highlight');
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

    return { childIds: page.nodes[groupId].childIds as string[], groupId };
  });

  await designPage.click(1500, 600); // deselect everything — start from a clean slate

  // the group row is expanded by default only for the panel, not the row — reveal its two children
  await page.getByRole('button', { name: 'Expand layer' }).click();

  // scope every row/background lookup to the LayersTree wrapper: PagesList renders the same shared
  // Tree component (same "Tree__row_"/"Tree__selectionBackground" CSS Modules classes) on this page
  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');
  await expect(rows).toHaveCount(3); // group + its two children

  await rows.nth(1).click({ modifiers: ['ControlOrMeta'] }); // Ctrl+click the first child → selection = [child]
  await rows.nth(0).click({ modifiers: ['ControlOrMeta'] }); // Ctrl+click the parent group

  const selectedIds = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  // the child drops out of the selection — a node and its ancestor group are never selected together
  expect(selectedIds).toEqual([before.groupId]);

  // structure: only the group row reads as selected; both children read as not-selected
  await expect(rows.nth(0).locator('[aria-selected="true"]')).toHaveCount(1);
  await expect(rows.nth(1).locator('[aria-selected="false"]')).toHaveCount(1);
  await expect(rows.nth(2).locator('[aria-selected="false"]')).toHaveCount(1);

  // the children still get a distinct highlight background, meeting the group's selection background
  // flush — the touching edges are squared so there is no gap between the two blocks
  const selectionBackground = layersTree.locator('[class*="Tree__selectionBackground"]:not([class*="--highlight"])');
  const highlightBackground = layersTree.locator('[class*="Tree__selectionBackground--highlight"]');

  await expect(selectionBackground).toHaveCount(1);
  await expect(highlightBackground).toHaveCount(1);
  await expect(selectionBackground).toHaveClass(/squareBottom/);
  await expect(selectionBackground).not.toHaveClass(/squareTop/);
  await expect(highlightBackground).toHaveClass(/squareTop/);
  await expect(highlightBackground).not.toHaveClass(/squareBottom/);
});

test('Ctrl+clicking a group row chevron in the Layers panel expands or collapses its whole subtree at once, keyed off that row', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-group-recursive-chevron-toggle');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 740, 140); // A
  await designPage.drawRectangle(760, 100, 800, 140); // B — adjacent, auto-selected
  await designPage.click(720, 120, { shift: true }); // add A back, selection = [B, A]
  await page.keyboard.press('Control+g'); // group-1 = [A, B]
  await page.keyboard.press('Control+g'); // group-2 = [group-1]
  await page.keyboard.press('Control+g'); // group-3 = [group-2] — nesting is g3 > g2 > g1 > [A, B]

  await designPage.click(1500, 600); // deselect

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const rows = layersTree.locator('[class*="Tree__row_"]');
  const chevronOf = (rowIndex: number): Locator => rows.nth(rowIndex).locator('[class*="TreeItem__toggleButton"]');

  // only the outermost group row shows, still collapsed
  await expect(rows).toHaveCount(1);

  // Ctrl+click the collapsed outer group's chevron → the entire subtree expands in one go
  await chevronOf(0).click({ modifiers: ['ControlOrMeta'] });
  await expect(rows).toHaveCount(5); // g3, g2, g1, A, B

  // Ctrl+click the (now expanded) outer group's chevron again → the whole subtree collapses back
  await chevronOf(0).click({ modifiers: ['ControlOrMeta'] });
  await expect(rows).toHaveCount(1);

  // the direction is keyed off the clicked row, not the outermost: expand-all again, then recursively
  // collapse from the middle group — only its own descendants fold away, g3 stays open
  await chevronOf(0).click({ modifiers: ['ControlOrMeta'] });
  await expect(rows).toHaveCount(5);
  await chevronOf(1).click({ modifiers: ['ControlOrMeta'] }); // g2's chevron, g2 currently expanded
  await expect(rows).toHaveCount(2); // g3 + g2 (collapsed)
});
