// store
import { addNode, deleteNode, moveNodes, updateNode } from 'store/design/slice';
import { selectActivePage, selectRenderOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { resolveDragReparentTarget } from '../resolveDragReparentTarget';

const addAutoLayoutFrame = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
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

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const addGridFrame = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
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

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const addFrame = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
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

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 20, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x, y }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const addGroup = (x: number, y: number): string => {
  store.dispatch(addNode({ childIds: [], height: 20, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 20, x, y }));

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const addMask = (x: number, y: number): string => {
  store.dispatch(
    addNode({ childIds: [], height: 20, name: 'Mask group', parentId: null, rotation: 0, type: NodeType.mask, width: 20, x, y }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const nodesOf = (): { rendered: ReturnType<typeof selectRenderOrderedNodes>; byId: ReturnType<typeof selectActivePage>['nodes'] } => ({
  byId: selectActivePage(store.getState()).nodes,
  rendered: selectRenderOrderedNodes(store.getState()),
});

const refs = (): TCanvasRefs => createCanvasRefs();
const dragState = (): TDragState => ({ hasMoved: true }) as unknown as TDragState;

describe('resolveDragReparentTarget', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should highlight the frame under the pointer and reparent the dragged node into it right away', () => {
    // mock
    const frameId = addFrame(0, 0, 300);
    const rectId = addRect(500, 500);
    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();

    // action
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 150, y: 150 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result
    const page = selectActivePage(store.getState());

    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(frameId);
    expect(page.nodes[rectId].parentId).toBe(frameId);
  });

  it('should reparent a node back to the root when the pointer is over empty canvas', () => {
    // mock
    const frameId = addFrame(0, 0, 100);
    const rectId = addRect(10, 10);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();

    // action
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 900, y: 900 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result
    const page = selectActivePage(store.getState());

    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBeNull();
    expect(page.nodes[rectId].parentId).toBeNull();
  });

  it('should not dispatch a move when the pointer stays inside the node’s current parent frame', () => {
    // mock
    const frameId = addFrame(0, 0, 300);
    const rectId = addRect(10, 10);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();

    // spy
    const spy = vi.spyOn(store, 'dispatch');

    // action
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 120, y: 120 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(frameId);

    spy.mockRestore();
  });

  it('should not eject a node out of its parent group when dragged over empty canvas — group membership is not a drag drop target', () => {
    // mock
    const groupId = addGroup(0, 0);
    const rectId = addRect(10, 10);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: groupId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();

    // spy
    const spy = vi.spyOn(store, 'dispatch');

    // action
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 900, y: 900 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(groupId);

    spy.mockRestore();
  });

  it('should keep a Group child fully sealed off — no reorder ghost, no reparent — even when its Group sits inside an auto-layout frame', () => {
    // mock — a Group nested inside an auto-layout frame; the dragged rect lives inside that Group.
    // Hit-testing the pointer would normally find the auto-layout ancestor and arm its reorder ghost —
    // that must never happen for a node whose immediate parent is a Group, it's a sealed environment
    const autoLayoutFrameId = addAutoLayoutFrame(0, 0, 300);
    const groupId = addGroup(10, 10);
    const rectId = addRect(20, 20);

    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: autoLayoutFrameId }));
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: groupId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();
    const spy = vi.spyOn(store, 'dispatch');

    // action — pointer still well inside the auto-layout frame's own bounds
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 40, y: 40 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result — sealed: no reorder ghost armed, no reparent dispatched, still a member of the Group
    expect(canvasRefs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(groupId);
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(groupId);

    spy.mockRestore();
  });

  it('should keep a Mask child fully sealed off — no reorder ghost, no reparent — even when its Mask sits inside an auto-layout frame', () => {
    // mock — same shape as the Group case, but the immediate parent is a Mask container
    const autoLayoutFrameId = addAutoLayoutFrame(0, 0, 300);
    const maskId = addMask(10, 10);
    const rectId = addRect(20, 20);

    store.dispatch(moveNodes({ nodeIds: [maskId], targetIndex: 0, targetParentId: autoLayoutFrameId }));
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: maskId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();
    const spy = vi.spyOn(store, 'dispatch');

    // action
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 40, y: 40 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result
    expect(canvasRefs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(maskId);
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(maskId);

    spy.mockRestore();
  });

  it('should stay a reorder inside the auto-layout parent — not nest — when the pointer is over a sibling frame that lives in that parent', () => {
    // mock — an auto-layout frame holding a plain sibling frame and the dragged rect
    const parentId = addAutoLayoutFrame(0, 0, 300);
    const siblingFrameId = addFrame(400, 400, 100);
    const rectId = addRect(500, 500);

    store.dispatch(moveNodes({ nodeIds: [siblingFrameId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 1, targetParentId: parentId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();
    const spy = vi.spyOn(store, 'dispatch');

    // action — pointer is right over the sibling frame's body, still inside the auto-layout parent
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 40, y: 40 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result — the target is the parent (reorder armed), the sibling frame is ignored, nothing reparents
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(parentId);
    expect(canvasRefs.transform.autoLayoutReorderPreviewRef.current).not.toBeNull();
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(parentId);

    spy.mockRestore();
  });

  it('should fall back to normal drop-target resolution once the pointer leaves the auto-layout parent', () => {
    // mock — same shape, but the pointer is now outside the parent frame entirely
    const parentId = addAutoLayoutFrame(0, 0, 100);
    const rectId = addRect(500, 500);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: parentId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();

    // action — well outside the parent's bounds
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 900, y: 900 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result — reorder mode is off; the node is ejected to the root
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBeNull();
    expect(canvasRefs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
  });

  it('shows the basic drop indicator, not the reorder ghost, while the modifier is held inside the parent', () => {
    // mock
    const parentId = addAutoLayoutFrame(0, 0, 300);
    const rectId = addRect(500, 500);
    const otherRectId = addRect(600, 600);

    store.dispatch(moveNodes({ nodeIds: [otherRectId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 1, targetParentId: parentId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();

    // action — modifier held, pointer still inside the parent
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 150, y: 150 },
      rendered,
      byId,
      canvasRefs,
      null,
      true,
      dragState(),
    );

    // result — indicator armed for the parent; the floating preview carries no reorder-ghost slots
    // (the block rides the cursor free, siblings just close the vacated gap)
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: parentId });
    expect(canvasRefs.transform.autoLayoutReorderPreviewRef.current?.draggedMemberSlots).toBeUndefined();
  });

  it('abandons reorder mode for the rest of the drag once the modifier is held while leaving the parent', () => {
    // mock
    const parentId = addAutoLayoutFrame(0, 0, 100);
    const rectId = addRect(10, 10);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: parentId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();
    const state = dragState();

    // action 1 — modifier held, pointer dragged out past the parent's bounds
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 900, y: 900 },
      rendered,
      byId,
      canvasRefs,
      null,
      true,
      state,
    );

    expect(state.reorderModeAbandoned).toBe(true);

    // action 2 — modifier released, node still (or back) in the parent, pointer home
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: parentId }));
    const back = nodesOf();

    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [back.byId[rectId]],
      { x: 50, y: 50 },
      back.rendered,
      back.byId,
      canvasRefs,
      null,
      false,
      state,
    );

    // result — sticky: still the basic floating mode (no reorder-ghost slots), not the reorder ghost
    expect(canvasRefs.transform.autoLayoutReorderPreviewRef.current?.draggedMemberSlots).toBeUndefined();
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: parentId });
  });

  it('should not lock a node that ignores auto layout into the reorder ghost, even while its pointer stays inside the parent', () => {
    // mock — an auto-layout frame holding a plain sibling and the dragged rect, which ignores auto layout
    const parentId = addAutoLayoutFrame(0, 0, 300);
    const siblingRectId = addRect(50, 50);
    const rectId = addRect(500, 500);

    store.dispatch(moveNodes({ nodeIds: [siblingRectId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 1, targetParentId: parentId }));
    store.dispatch(updateNode({ changes: { ignoreAutoLayout: true }, id: rectId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();
    const spy = vi.spyOn(store, 'dispatch');

    // action — pointer stays inside the auto-layout parent, well away from the sibling
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 200, y: 200 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result — no reorder ghost armed, no reparent dispatched; the drag is left to a plain translate
    expect(canvasRefs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(parentId);

    spy.mockRestore();
  });

  it('should not arm the auto-layout drop target for a node that ignores auto layout, even when dropped over a different auto-layout frame', () => {
    // mock — the dragged rect (flagged ignoreAutoLayout) currently lives outside any frame; the pointer is over a
    // second, unrelated auto-layout frame
    const otherAutoLayoutFrameId = addAutoLayoutFrame(0, 0, 300);
    const rectId = addRect(900, 900);

    store.dispatch(updateNode({ changes: { ignoreAutoLayout: true }, id: rectId }));

    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();
    const spy = vi.spyOn(store, 'dispatch');

    // action — pointer is over the other auto-layout frame's body
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 150, y: 150 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result — reparents there via the plain drop-target path, not the reorder/drop-target-index machinery
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(otherAutoLayoutFrameId);
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toBeNull();
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(true);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(otherAutoLayoutFrameId);

    spy.mockRestore();
  });

  it('should arm the grid drop target instead of reparenting right away when the pointer is over a grid frame', () => {
    // mock
    const frameId = addGridFrame(0, 0, 300);
    const rectId = addRect(500, 500);
    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();

    // spy
    const spy = vi.spyOn(store, 'dispatch');

    // action
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 75, y: 75 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(frameId);
    expect(canvasRefs.transform.gridDropTargetRef.current).toEqual({ columnStart: 0, count: 1, frameId, rowStart: 0 });
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toBeNull();
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);

    spy.mockRestore();
  });

  it('should delegate to the auto-layout drop target resolver instead of reparenting right away', () => {
    // mock
    const frameId = addAutoLayoutFrame(0, 0, 300);
    const rectId = addRect(500, 500);
    const canvasRefs = refs();
    const { rendered, byId } = nodesOf();

    // spy
    const spy = vi.spyOn(store, 'dispatch');

    // action
    resolveDragReparentTarget(
      store.dispatch,
      store.getState(),
      [byId[rectId]],
      { x: 150, y: 150 },
      rendered,
      byId,
      canvasRefs,
      null,
      false,
      dragState(),
    );

    // result
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(frameId);
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId, index: 0 });
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);

    spy.mockRestore();
  });
});
