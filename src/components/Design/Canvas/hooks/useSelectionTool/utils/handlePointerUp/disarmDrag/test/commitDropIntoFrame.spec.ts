// store
import { addNode, deleteNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { commitDropIntoFrame } from '../commitDropIntoFrame';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const addFrameNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addSectionNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      childIds: [],
      fill: '#444',
      height: size,
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addGroupNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({ childIds: [], height: size, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addGridFrameNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      gridColumnCount: 2,
      height: size,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrameNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: size,
      layoutMode: LayoutMode.vertical,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#00ff00', height: size, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const dragState = (hasMoved: boolean): TDragState => ({
  candidateShapes: [],
  ctrlMarqueeFallback: null,
  dispatchThrottle: { frameId: null, run: null },
  hasMoved,
  nodeOrigins: {},
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
});

describe('commitDropIntoFrame', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should reparent the dragged selection into the frame under the drop-target ref', () => {
    // mock
    const frameId = addFrameNode(0, 0);
    const rectId = addRectNode(500, 500);

    store.dispatch(setSelection([rectId]));

    const canvasRefs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: frameId } } });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[rectId].parentId).toBe(frameId);
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([rectId]);
    expect(page.rootOrder).not.toContain(rectId);
  });

  it('should insert a brand-new element into the grid by reading-order position while automatic positioning is on, instead of anchoring it', () => {
    // mock — 2-column grid, one child already inside; automatic positioning stays at its default (true)
    const gridId = addGridFrameNode(0, 0);
    const firstId = addRectNode(10, 10);

    store.dispatch(moveNodes({ nodeIds: [firstId], targetIndex: 0, targetParentId: gridId }));

    const droppedId = addRectNode(500, 500);

    store.dispatch(setSelection([droppedId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: gridId },
        gridDropTargetRef: { current: { cells: [{ column: 1, row: 2 }], frameId: gridId } },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — reordered into childIds so the auto-flow engine places it: no anchor, no flag
    // flip, but it still stretches to fill whatever cell it lands in
    const page = selectActivePage(store.getState());
    expect((page.nodes[gridId] as { childIds: string[] }).childIds).toEqual([firstId, droppedId]);
    expect(page.nodes[gridId]).not.toMatchObject({ gridAutoPlacement: false });
    expect(page.nodes[droppedId]).not.toMatchObject({ gridColumnAnchorIndex: 1, gridRowAnchorIndex: 2 });
    expect(page.nodes[droppedId]).toMatchObject({ heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill });
  });

  it('should still pin a brand-new element into the exact hovered grid cell and stretch it to fill once automatic positioning is off', () => {
    // mock — 2-column grid already switched to manual placement
    const gridId = addGridFrameNode(0, 0);
    const firstId = addRectNode(10, 10);

    store.dispatch(moveNodes({ nodeIds: [firstId], targetIndex: 0, targetParentId: gridId }));
    store.dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: gridId }));

    const droppedId = addRectNode(500, 500);

    store.dispatch(setSelection([droppedId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: gridId },
        gridDropTargetRef: { current: { cells: [{ column: 1, row: 2 }], frameId: gridId } },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — unchanged manual-mode behavior: anchored at the exact cell, stretched to fill
    const page = selectActivePage(store.getState());
    expect((page.nodes[gridId] as { childIds: string[] }).childIds).toEqual([firstId, droppedId]);
    expect(page.nodes[gridId]).toMatchObject({ gridAutoPlacement: false });
    expect(page.nodes[droppedId]).toMatchObject({
      gridColumnAnchorIndex: 1,
      gridRowAnchorIndex: 2,
      heightSizingMode: SizingMode.fill,
      widthSizingMode: SizingMode.fill,
    });
  });

  it('should block repositioning a child already inside the grid while automatic positioning is on (the default), leaving it untouched', () => {
    // mock — 2-column grid, two children already inside; dragging the first one onto another cell
    const gridId = addGridFrameNode(0, 0);
    const firstId = addRectNode(10, 10);
    const secondId = addRectNode(20, 20);

    store.dispatch(moveNodes({ nodeIds: [firstId, secondId], targetIndex: 0, targetParentId: gridId }));
    store.dispatch(setSelection([firstId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: gridId },
        gridDropTargetRef: { current: { cells: [{ column: 1, row: 2 }], frameId: gridId } },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — nothing committed: no anchor, no reorder, gridAutoPlacement left alone
    const page = selectActivePage(store.getState());
    expect((page.nodes[gridId] as { childIds: string[] }).childIds).toEqual([firstId, secondId]);
    expect(page.nodes[firstId]).not.toMatchObject({ gridColumnAnchorIndex: 1, gridRowAnchorIndex: 2 });
    expect(page.nodes[gridId]).not.toMatchObject({ gridAutoPlacement: false });
  });

  it('should still allow repositioning a child already inside the grid once automatic positioning is explicitly off', () => {
    // mock — same setup, but the frame has already been switched to manual placement
    const gridId = addGridFrameNode(0, 0);
    const firstId = addRectNode(10, 10);
    const secondId = addRectNode(20, 20);

    store.dispatch(moveNodes({ nodeIds: [firstId, secondId], targetIndex: 0, targetParentId: gridId }));
    store.dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: gridId }));
    store.dispatch(setSelection([firstId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: gridId },
        gridDropTargetRef: { current: { cells: [{ column: 1, row: 2 }], frameId: gridId } },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — the explicit drop still commits, exactly like the manual-mode drag it always was
    const page = selectActivePage(store.getState());
    expect(page.nodes[firstId]).toMatchObject({ gridColumnAnchorIndex: 1, gridRowAnchorIndex: 2 });
  });

  it('should insert a brand-new element at the indicator’s reading-order position while automatic positioning is on, without anchoring anyone', () => {
    // mock — 2-column grid holding two children in reading order; automatic positioning stays on
    const gridId = addGridFrameNode(0, 0);
    const aId = addRectNode(10, 10);
    const bId = addRectNode(20, 20);

    store.dispatch(moveNodes({ nodeIds: [aId, bId], targetIndex: 0, targetParentId: gridId }));

    const droppedId = addRectNode(500, 500);

    store.dispatch(setSelection([droppedId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: gridId },
        gridDropTargetRef: {
          current: { cells: [], frameId: gridId, indicator: { column: 1, row: 0, side: 'left' }, insertIndex: 1 },
        },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — dropped node takes reading index 1 via a plain reorder; the auto-flow engine (not
    // an explicit anchor) is what then pushes "b" into the next row; the dropped node still
    // stretches to fill its cell, but "b" (never explicitly dropped) keeps its own sizing
    const page = selectActivePage(store.getState());
    expect((page.nodes[gridId] as { childIds: string[] }).childIds).toEqual([aId, droppedId, bId]);
    expect(page.nodes[gridId]).not.toMatchObject({ gridAutoPlacement: false });
    expect(page.nodes[droppedId]).not.toMatchObject({ gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0 });
    expect(page.nodes[droppedId]).toMatchObject({ heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill });
    expect(page.nodes[bId]).not.toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 });
  });

  it('should still insert at the indicator index and anchor-push the trailing grid children once automatic positioning is off', () => {
    // mock — same 2-column grid, but already switched to manual placement
    const gridId = addGridFrameNode(0, 0);
    const aId = addRectNode(10, 10);
    const bId = addRectNode(20, 20);

    store.dispatch(moveNodes({ nodeIds: [aId, bId], targetIndex: 0, targetParentId: gridId }));
    store.dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: gridId }));

    const droppedId = addRectNode(500, 500);

    store.dispatch(setSelection([droppedId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        dropTargetFrameIdRef: { current: gridId },
        gridDropTargetRef: {
          current: { cells: [], frameId: gridId, indicator: { column: 1, row: 0, side: 'left' }, insertIndex: 1 },
        },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — unchanged manual-mode behavior: dropped node takes reading index 1, "b" slides
    // into the next row, both explicitly anchored
    const page = selectActivePage(store.getState());
    expect(page.nodes[gridId]).toMatchObject({ gridAutoPlacement: false });
    expect(page.nodes[droppedId]).toMatchObject({
      gridColumnAnchorIndex: 1,
      gridRowAnchorIndex: 0,
      heightSizingMode: SizingMode.fill,
      widthSizingMode: SizingMode.fill,
    });
    expect(page.nodes[bId]).toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 });
  });

  it('should pop the dragged selection back to the root when dropped over empty canvas', () => {
    // mock — rect starts already nested inside a frame
    const frameId = addFrameNode(0, 0);
    const rectId = addRectNode(50, 50);

    store.dispatch(setSelection([rectId]));
    commitDropIntoFrame(store.dispatch, dragState(true), createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: frameId } } }));

    // action — dropped again with no target frame this time
    commitDropIntoFrame(store.dispatch, dragState(true), createCanvasRefs());

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[rectId].parentId).toBeNull();
    expect(page.rootOrder).toContain(rectId);
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([]);
  });

  it('should reparent the dragged selection into a section under the drop-target ref, same as a frame', () => {
    // mock
    const sectionId = addSectionNode(0, 0);
    const rectId = addRectNode(500, 500);

    store.dispatch(setSelection([rectId]));

    const canvasRefs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: sectionId } } });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[rectId].parentId).toBe(sectionId);
    expect((page.nodes[sectionId] as { childIds: string[] }).childIds).toEqual([rectId]);
    expect(page.rootOrder).not.toContain(rectId);
  });

  it('should not eject a node out of its parent group when dropped over empty canvas — group membership is not a drag drop target', () => {
    // mock — rect nested inside a group (e.g. a mask group), then dragged clear of every frame/section
    const groupId = addGroupNode(0, 0);
    const rectId = addRectNode(50, 50);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(setSelection([rectId]));

    // action — no drop-target ref set, so nothing frame/section-shaped is under the pointer
    commitDropIntoFrame(store.dispatch, dragState(true), createCanvasRefs());

    // result — the rect stays in the group
    const page = selectActivePage(store.getState());
    expect(page.nodes[rectId].parentId).toBe(groupId);
    expect((page.nodes[groupId] as { childIds: string[] }).childIds).toEqual([rectId]);
    expect(page.rootOrder).not.toContain(rectId);
  });

  it('should do nothing when the drag never moved', () => {
    // mock
    const frameId = addFrameNode(0, 0);
    const rectId = addRectNode(500, 500);

    store.dispatch(setSelection([rectId]));

    // action
    commitDropIntoFrame(store.dispatch, dragState(false), createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: frameId } } }));

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[rectId].parentId).toBeNull();
  });

  it('should insert the dragged selection at the computed auto-layout drop index, instead of appending it', () => {
    // mock — an auto-layout frame with one existing child; the drop target ref says "insert at index 0"
    const frameId = addAutoLayoutFrameNode(0, 0);
    const existingId = addRectNode(0, 0);
    store.dispatch(moveNodes({ nodeIds: [existingId], targetIndex: 0, targetParentId: frameId }));

    const rectId = addRectNode(500, 500);
    store.dispatch(setSelection([rectId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: { current: { frameId, index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} } },
        dropTargetFrameIdRef: { current: frameId },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — dropped before the existing child, not appended after it
    const page = selectActivePage(store.getState());
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([rectId, existingId]);
  });

  it('should fall back to appending when the auto-layout drop target ref belongs to a different frame', () => {
    // mock — stale ref pointing at some other frame id than the current drop target
    const frameId = addAutoLayoutFrameNode(0, 0);
    const existingId = addRectNode(0, 0);
    store.dispatch(moveNodes({ nodeIds: [existingId], targetIndex: 0, targetParentId: frameId }));

    const rectId = addRectNode(500, 500);
    store.dispatch(setSelection([rectId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'stale-frame', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        dropTargetFrameIdRef: { current: frameId },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — appended after the existing child, per the ordinary fallback
    const page = selectActivePage(store.getState());
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([existingId, rectId]);
  });

  it('reorders within the same auto-layout parent via the drop-indicator index when there is no reorder preview (modifier-held basic mode)', () => {
    // mock — child already in an auto-layout frame; only the drop-indicator ref is set (no ghost preview)
    const frameId = addAutoLayoutFrameNode(0, 0);
    const firstId = addRectNode(0, 0);
    const secondId = addRectNode(0, 0);
    store.dispatch(moveNodes({ nodeIds: [firstId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [secondId], targetIndex: 1, targetParentId: frameId }));
    store.dispatch(setSelection([secondId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: { current: { frameId, index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} } },
        dropTargetFrameIdRef: { current: frameId },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — the second child moved to the front, per the indicator index
    expect((selectActivePage(store.getState()).nodes[frameId] as { childIds: string[] }).childIds).toEqual([secondId, firstId]);
  });

  it('should do nothing when the drop target is still the node’s current parent', () => {
    // mock
    const frameId = addFrameNode(0, 0);
    const rectId = addRectNode(50, 50);

    store.dispatch(setSelection([rectId]));
    commitDropIntoFrame(store.dispatch, dragState(true), createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: frameId } } }));

    // action — dropped again over the same frame it's already inside
    commitDropIntoFrame(store.dispatch, dragState(true), createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: frameId } } }));

    // result — still exactly one entry in childIds, not reordered/duplicated
    const page = selectActivePage(store.getState());
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([rectId]);
  });

  it('should commit a same-parent auto-layout reorder using the preview’s active index', () => {
    // mock — two children of an auto-layout frame; the second (dragged) is being reordered before the first
    const frameId = addAutoLayoutFrameNode(0, 0);
    const firstId = addRectNode(0, 0);
    const draggedId = addRectNode(0, 100);

    store.dispatch(moveNodes({ nodeIds: [firstId, draggedId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(setSelection([draggedId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId, positions: {} } },
        dropTargetFrameIdRef: { current: frameId },
      },
    });

    // action
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — moved to index 0, ahead of the first child
    const page = selectActivePage(store.getState());
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([draggedId, firstId]);
  });

  it('should commit a multi-node reorder preserving the dragged block’s own current childIds order, not the click/selection order', () => {
    // mock — three children of an auto-layout frame: first, then the pair being dragged (middle,
    // last). Selected in the OPPOSITE order to their visual/childIds order (last clicked first) —
    // committing raw click order would silently swap the pair's own relative order
    const frameId = addAutoLayoutFrameNode(0, 0);
    const firstId = addRectNode(0, 0);
    const middleId = addRectNode(0, 20);
    const lastId = addRectNode(0, 40);

    store.dispatch(moveNodes({ nodeIds: [firstId, middleId, lastId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(setSelection([lastId, middleId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId, positions: {} } },
        dropTargetFrameIdRef: { current: frameId },
      },
    });

    // action — reordering the [middle, last] pair to the very front
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — the pair keeps its own original relative order (middle above last), just moved as
    // a block ahead of "first"
    const page = selectActivePage(store.getState());
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([middleId, lastId, firstId]);
  });

  it('should ignore a stale reorder preview left over from a different auto-layout frame', () => {
    // mock — the preview ref still points at some other frame id, so it must not be trusted here
    const frameId = addAutoLayoutFrameNode(0, 0);
    const rectId = addRectNode(50, 50);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(setSelection([rectId]));

    const canvasRefs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'stale-frame', positions: {} } },
        dropTargetFrameIdRef: { current: frameId },
      },
    });

    // action — dropped back over its own current parent; only a matching preview should trigger a commit
    commitDropIntoFrame(store.dispatch, dragState(true), canvasRefs);

    // result — no reorder happened
    const page = selectActivePage(store.getState());
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([rectId]);
  });
});
