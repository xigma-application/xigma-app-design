// store
import { addNode, deleteNode, moveNodes } from 'store/design/slice';
import { selectActivePage, selectRenderOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { updateDragDropTarget } from '../updateDragDropTarget';

const canvasRefs = (): TCanvasRefs => ({ transform: { dropTargetFrameIdRef: { current: 'stale' } } }) as unknown as TCanvasRefs;

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

const addSection = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      fill: '#000',
      height: 20,
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 20,
      x,
      y,
    }),
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

describe('updateDragDropTarget', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should highlight the frame under the pointer and reparent the dragged node into it right away', () => {
    const frameId = addFrame(0, 0, 300);
    const rectId = addRect(500, 500);
    const refs = canvasRefs();
    const { rendered, byId } = nodesOf();

    updateDragDropTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 150, y: 150 }, rendered, byId, refs);

    const page = selectActivePage(store.getState());
    expect(refs.transform.dropTargetFrameIdRef.current).toBe(frameId);
    expect(page.nodes[rectId].parentId).toBe(frameId);
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toContain(rectId);
  });

  it('should reparent a node back to the root when the pointer is over empty canvas', () => {
    const frameId = addFrame(0, 0, 100);
    const rectId = addRect(10, 10);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));

    const refs = canvasRefs();
    const { rendered, byId } = nodesOf();

    updateDragDropTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 900, y: 900 }, rendered, byId, refs);

    const page = selectActivePage(store.getState());
    expect(refs.transform.dropTargetFrameIdRef.current).toBeNull();
    expect(page.nodes[rectId].parentId).toBeNull();
    expect(page.rootOrder).toContain(rectId);
  });

  it('should not dispatch a move when the pointer stays inside the node’s current parent frame', () => {
    const frameId = addFrame(0, 0, 300);
    const rectId = addRect(10, 10);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));

    const refs = canvasRefs();
    const { rendered, byId } = nodesOf();
    const spy = vi.spyOn(store, 'dispatch');

    updateDragDropTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 120, y: 120 }, rendered, byId, refs);

    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(refs.transform.dropTargetFrameIdRef.current).toBe(frameId);

    spy.mockRestore();
  });

  it('should highlight a section under the pointer and reparent the dragged node into it, same as a frame', () => {
    const sectionId = addSection(0, 0);
    const rectId = addRect(500, 500);
    const refs = canvasRefs();
    const { rendered, byId } = nodesOf();

    updateDragDropTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 10, y: 10 }, rendered, byId, refs);

    const page = selectActivePage(store.getState());
    expect(refs.transform.dropTargetFrameIdRef.current).toBe(sectionId);
    expect(page.nodes[rectId].parentId).toBe(sectionId);
    expect((page.nodes[sectionId] as { childIds: string[] }).childIds).toContain(rectId);
  });

  it('should clear the ref and do nothing when the selection contains a section', () => {
    addFrame(0, 0, 300);
    const sectionId = addSection(500, 500);
    const refs = canvasRefs();
    const { rendered, byId } = nodesOf();
    const spy = vi.spyOn(store, 'dispatch');

    updateDragDropTarget(store.dispatch, store.getState(), [byId[sectionId]], { x: 150, y: 150 }, rendered, byId, refs);

    expect(refs.transform.dropTargetFrameIdRef.current).toBeNull();
    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);

    spy.mockRestore();
  });

  it('should not eject a node out of its parent group when dragged over empty canvas — group membership is not a drag drop target', () => {
    const groupId = addGroup(0, 0);
    const rectId = addRect(10, 10);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: groupId }));

    const refs = canvasRefs();
    const { rendered, byId } = nodesOf();
    const spy = vi.spyOn(store, 'dispatch');

    updateDragDropTarget(store.dispatch, store.getState(), [byId[rectId]], { x: 900, y: 900 }, rendered, byId, refs);

    expect(spy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(groupId);

    spy.mockRestore();
  });

  it('should clear the ref and do nothing when nothing is selected', () => {
    addFrame(0, 0, 300);
    const refs = canvasRefs();
    const { rendered, byId } = nodesOf();

    updateDragDropTarget(store.dispatch, store.getState(), [], { x: 150, y: 150 }, rendered, byId, refs);

    expect(refs.transform.dropTargetFrameIdRef.current).toBeNull();
  });
});
