import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useTreeSource } from '../useTreeSource';

// store
import { addNode, deleteNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, PathType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useTreeSource', () => {
  let idA: string;
  let idB: string;

  beforeEach(() => {
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
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

  it("should return a group's children for a group node", () => {
    // mock
    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    const [groupId] = selectActivePage(store.getState()).selectedIds;

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const groupNode = selectActivePage(store.getState()).nodes[groupId];

    // result
    expect(result.current.getChildren(groupNode)?.map((node) => node.id)).toEqual([idA, idB]);
  });

  it('should return undefined for a non-group node, since it has no expandable children', () => {
    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const node = selectActivePage(store.getState()).nodes[idA];

    // result
    expect(result.current.getChildren(node)).toBeUndefined();
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
        fillColor: '#000000',
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
        fillColor: '#000000',
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
        fillColor: '#000000',
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
