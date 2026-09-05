// store
import { addNode, deleteNode, moveNodes } from 'store/design/slice';
import { selectActivePage, selectRenderOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveDragReparentTarget } from '../resolveDragReparentTarget';

const addAutoLayoutFrame = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: size,
      itemSpacing: 0,
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

const nodesOf = (): { rendered: ReturnType<typeof selectRenderOrderedNodes>; byId: ReturnType<typeof selectActivePage>['nodes'] } => ({
  byId: selectActivePage(store.getState()).nodes,
  rendered: selectRenderOrderedNodes(store.getState()),
});

const refs = (): TCanvasRefs => createCanvasRefs();

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
    resolveDragReparentTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 150, y: 150 }, rendered, byId, canvasRefs);

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
    resolveDragReparentTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 900, y: 900 }, rendered, byId, canvasRefs);

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
    resolveDragReparentTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 120, y: 120 }, rendered, byId, canvasRefs);

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
    resolveDragReparentTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 900, y: 900 }, rendered, byId, canvasRefs);

    // result
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(groupId);

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
    resolveDragReparentTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 150, y: 150 }, rendered, byId, canvasRefs);

    // result
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(frameId);
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId, index: 0 });
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);

    spy.mockRestore();
  });
});
