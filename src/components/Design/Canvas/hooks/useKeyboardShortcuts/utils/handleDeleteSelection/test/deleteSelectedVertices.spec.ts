// store
import { addNode, setSelection, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deleteSelectedVertices } from '../deleteSelectedVertices';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { getVectorFaceVertexIds } from 'utils/canvas/vectorNetwork/getVectorFaceVertexIds';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 }, v3: { id: 'v3', x: 20, y: 20 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addSplitSquareVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v5', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
        s5: { endId: 'v6', id: 's5', startId: 'v5', tangentEnd: null, tangentStart: null },
        s6: { endId: 'v1', id: 's6', startId: 'v6', tangentEnd: null, tangentStart: null },
        s7: { endId: 'v6', id: 's7', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
        v3: { id: 'v3', x: 100, y: 50 },
        v4: { id: 'v4', x: 100, y: 100 },
        v5: { id: 'v5', x: 0, y: 100 },
        v6: { id: 'v6', x: 0, y: 50 },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addClosedTriangleVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        ab: { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
        bc: { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
        ca: { endId: 'a', id: 'ca', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 5, y: 10 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('deleteSelectedVertices', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should dispatch one updateNode per owning node, dropping the selected vertex and any segment it touched', () => {
    // mock — deleting the shared middle vertex v2 removes both segments and leaves v1/v3 dangling
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    deleteSelectedVertices(store.dispatch, [node], ['v2']);

    // result
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updated.segments).toEqual({});
    expect(updated.vertices).toEqual({});
  });

  it('should keep a vertex still held by another segment, dropping only the one it lost', () => {
    // mock — deleting v1 only removes s1; v2 stays held by s2, v3 is untouched
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    deleteSelectedVertices(store.dispatch, [node], ['v1']);

    // result
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updated.segments)).toEqual(['s2']);
    expect(Object.keys(updated.vertices)).toEqual(['v2', 'v3']);
  });

  it('should delete an isolated selected sector entirely when it has no untouched neighbor', () => {
    // mock — a closed triangle, no neighboring face to protect
    const nodeId = addClosedTriangleVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before — every vertex of the triangle selected (a "sector" selection)
    deleteSelectedVertices(store.dispatch, [node], ['a', 'b', 'c']);

    // result — the whole boundary is gone, nothing left to protect
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updated.segments).toEqual({});
    expect(updated.vertices).toEqual({});
  });

  it('should protect the boundary shared with an untouched neighboring sector when deleting a selected sector', () => {
    // mock — a square split into a top/bottom half by divider s7 (v3<->v6)
    const nodeId = addSplitSquareVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before — only the top half's vertices selected (v1, v2, v3, v6), bottom half untouched
    deleteSelectedVertices(store.dispatch, [node], ['v1', 'v2', 'v3', 'v6']);

    // result — the top's own exclusive edges (s1, s2, s6) are gone, but the divider (s7) and the
    // bottom's own boundary (s3, s4, s5) survive since the bottom half was never touched
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updated.segments).sort()).toEqual(['s3', 's4', 's5', 's7']);
    expect(Object.keys(updated.vertices).sort()).toEqual(['v3', 'v4', 'v5', 'v6']);
  });

  it('should also delete an extra selected vertex outside the sector, on top of protecting the shared boundary', () => {
    // mock — same split square, top half fully selected as a sector plus the unrelated bottom vertex v5
    const nodeId = addSplitSquareVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    deleteSelectedVertices(store.dispatch, [node], ['v1', 'v2', 'v3', 'v6', 'v5']);

    // result — the sector subtract protects the divider (s7), but v5 (and its segments s4/s5) still go
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updated.segments).sort()).toEqual(['s3', 's7']);
    expect(Object.keys(updated.vertices).sort()).toEqual(['v3', 'v4', 'v6']);
  });

  it('should drop the deleted sector from filledFaceKeys', () => {
    // mock — the top half painted, then deleted as a sector
    const nodeId = addSplitSquareVectorNode();
    const bareNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const topFaceKey = deriveVectorFaces(bareNode).find((face) => getVectorFaceVertexIds(face).sort().join(',') === 'v1,v2,v3,v6')!.key;

    store.dispatch(updateNode({ changes: { filledFaceKeys: [topFaceKey] }, id: nodeId }));
    const filledNode = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    deleteSelectedVertices(store.dispatch, [filledNode], ['v1', 'v2', 'v3', 'v6']);

    // result
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updated.filledFaceKeys).not.toContain(topFaceKey);
  });
});
