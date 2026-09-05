import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useTreeSource } from '../useTreeSource';

// store
import { addNode, deleteNode, groupNodes, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, PathType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useTreeSource', () => {
  let idA: string;
  let idB: string;

  beforeEach(() => {
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 10,
        name: 'Frame A',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 10,
        name: 'Frame B',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
  });

  afterEach(() => {
    store.dispatch(deleteNode(idA));
    store.dispatch(deleteNode(idB));
    store.dispatch(setSelection([]));
  });

  it('should return the active page rootOrder nodes as roots', () => {
    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });

    // result
    expect(result.current.roots.map((node) => node.id)).toEqual(expect.arrayContaining([idA, idB]));
  });

  it('should list roots front-most (last in rootOrder) first, reversed relative to rootOrder', () => {
    // before — idA was added before idB, so rootOrder ends with [..., idA, idB] (idB in front)
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const rootIds = result.current.roots.map((node) => node.id);

    // result
    expect(rootIds.indexOf(idB)).toBeLessThan(rootIds.indexOf(idA));
  });

  it("should return a group's children for a group node, front-most (last in childIds) first", () => {
    // mock — idA was added before idB, so childIds ends up [idA, idB] (idB in front)
    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    const [groupId] = selectActivePage(store.getState()).selectedIds;

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const groupNode = selectActivePage(store.getState()).nodes[groupId];

    // result — reversed relative to childIds, so the front-most child (idB) lists first
    expect(result.current.getChildren(groupNode)?.map((node) => node.id)).toEqual([idB, idA]);
  });

  it("should return a plain frame's children reversed relative to childIds, front-most (last in childIds) first", () => {
    // mock — two rectangles moved into frame A, in order, so childIds ends up [rectA, rectB]
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 5,
        name: 'Rectangle A',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 5,
        x: 0,
        y: 0,
      }),
    );
    const rectA = selectActivePage(store.getState()).rootOrder.at(-1) as string;
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 5,
        name: 'Rectangle B',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 5,
        x: 0,
        y: 0,
      }),
    );
    const rectB = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    store.dispatch(moveNodes({ nodeIds: [rectA], targetIndex: 0, targetParentId: idA }));
    store.dispatch(moveNodes({ nodeIds: [rectB], targetIndex: 1, targetParentId: idA }));

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const frameNode = selectActivePage(store.getState()).nodes[idA];

    // result — reversed relative to childIds, so the front-most child (rectB) lists first
    expect(result.current.getChildren(frameNode)?.map((node) => node.id)).toEqual([rectB, rectA]);
  });

  it("should return an auto-layout frame's children in forward (layout) order, not reversed", () => {
    // mock — an auto-layout frame with two rectangles, in the same order they were laid out
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 100,
        layoutMode: LayoutMode.vertical,
        name: 'Auto-layout Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const autoLayoutFrameId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 5,
        name: 'Rectangle A',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 5,
        x: 0,
        y: 0,
      }),
    );
    const rectA = selectActivePage(store.getState()).rootOrder.at(-1) as string;
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 5,
        name: 'Rectangle B',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 5,
        x: 0,
        y: 0,
      }),
    );
    const rectB = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    store.dispatch(moveNodes({ nodeIds: [rectA], targetIndex: 0, targetParentId: autoLayoutFrameId }));
    store.dispatch(moveNodes({ nodeIds: [rectB], targetIndex: 1, targetParentId: autoLayoutFrameId }));

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const frameNode = selectActivePage(store.getState()).nodes[autoLayoutFrameId];

    // result — forward order, matching the visual layout flow (rectA is topmost, listed first)
    expect(result.current.getChildren(frameNode)?.map((node) => node.id)).toEqual([rectA, rectB]);

    // cleanup
    store.dispatch(deleteNode(autoLayoutFrameId));
  });

  it('should return undefined for a plain leaf node, since it has no expandable children', () => {
    // mock — a rectangle, unlike a frame, is never a container
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const rectangleId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const node = selectActivePage(store.getState()).nodes[rectangleId];

    // result
    expect(result.current.getChildren(node)).toBeUndefined();

    // cleanup
    store.dispatch(deleteNode(rectangleId));
  });

  it('should return an empty array for an empty frame, since it is a container with no children yet', () => {
    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const node = selectActivePage(store.getState()).nodes[idA];

    // result
    expect(result.current.getChildren(node)).toEqual([]);
  });

  it('should hide an auto-drawn ellipse text-path node from the roots — it is a guide, not a layer', () => {
    // mock
    store.dispatch(
      addNode({
        height: 100,
        name: 'Ellipse Path',
        parentId: null,
        pathType: PathType.ellipse,
        rotation: 0,
        type: NodeType.path,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const [pathId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });

    // result
    expect(result.current.roots.map((node) => node.id)).not.toContain(pathId);

    // after
    store.dispatch(deleteNode(pathId));
  });

  it('should hide a vector attached as a text-on-path guide from the roots, once a text node references it', () => {
    // mock
    store.dispatch(
      addNode({
        defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
      }),
    );
    const [vectorId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    // action — bind a text node onto it
    store.dispatch(
      addNode({
        content: 'Hi',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 0,
        name: 'Text',
        parentId: null,
        pathId: vectorId,
        rotation: 0,
        type: NodeType.text,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const [textId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    const { result } = renderHook(() => useTreeSource(), { wrapper });

    // result — the vector is gone from the roots, the text stays
    expect(result.current.roots.map((node) => node.id)).not.toContain(vectorId);
    expect(result.current.roots.map((node) => node.id)).toContain(textId);

    // after
    store.dispatch(deleteNode(textId));
    store.dispatch(deleteNode(vectorId));
  });

  it('should still list a plain, unbound vector — only a text-path-bound one is hidden', () => {
    // mock
    store.dispatch(
      addNode({
        defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
      }),
    );
    const [vectorId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });

    // result
    expect(result.current.roots.map((node) => node.id)).toContain(vectorId);

    // after
    store.dispatch(deleteNode(vectorId));
  });

  it("should also hide a text-path-bound vector from a group's children", () => {
    // mock
    store.dispatch(
      addNode({
        defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
      }),
    );
    const [vectorId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    store.dispatch(
      addNode({
        content: 'Hi',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 0,
        name: 'Text',
        parentId: null,
        pathId: vectorId,
        rotation: 0,
        type: NodeType.text,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const [textId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    store.dispatch(setSelection([vectorId, textId]));
    store.dispatch(groupNodes());
    const [groupId] = selectActivePage(store.getState()).selectedIds;

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const groupNode = selectActivePage(store.getState()).nodes[groupId];

    // result
    expect(result.current.getChildren(groupNode)?.map((node) => node.id)).toEqual([textId]);

    // after
    store.dispatch(deleteNode(groupId));
  });
});
