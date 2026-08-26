// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorSplit } from '../commitVectorSplit';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

// a=(0,0) b=(100,0) c=(100,100) d=(0,100), s1 top / s2 right / s3 bottom / s4 left, optionally rotated
// around the square's own center so the multi-node baking path can be exercised
const addSquareNode = (filled: boolean, rotation = 0): string => {
  const segments = {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
  } as const;
  const vertices = {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
  };
  const [face] = deriveVectorFaces({
    fillColor: null,
    filledFaceKeys: [],
    id: 'probe',
    name: '',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  });

  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: filled ? [getVectorFillLoopKey(face.pieceKeys)] : [],
      name: 'Vector',
      parentId: null,
      rotation,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('commitVectorSplit', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should sever a lone two-point segment into two genuinely disconnected halves, so it must become two separate nodes', () => {
    // mock — a node with only one segment: severing its only connection disconnects its two endpoints
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const rootOrderBefore = store.getState().design.rootOrder.length;

    // before
    const resultNodeIds = commitVectorSplit(store.dispatch, node, 's1', 0.5);

    // result
    expect(resultNodeIds).toHaveLength(2);
    expect(store.getState().design.rootOrder).toHaveLength(rootOrderBefore + 1);

    resultNodeIds.forEach((id) => {
      const resultNode = store.getState().design.nodes[id] as TVectorNode;

      expect(Object.keys(resultNode.segments)).toHaveLength(1);
    });
  });

  it('should keep a single node when severing one edge of a closed loop, since the other edges still bridge it into one open chain', () => {
    // mock
    const nodeId = addSquareNode(false);
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const rootOrderBefore = store.getState().design.rootOrder.length;

    // before — split the left edge (s4) at its midpoint
    const resultNodeIds = commitVectorSplit(store.dispatch, node, 's4', 0.5);

    // result
    expect(resultNodeIds).toEqual([nodeId]);
    expect(store.getState().design.rootOrder).toHaveLength(rootOrderBefore);

    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updatedNode.vertices)).toHaveLength(6);
  });

  it('should split into two separate nodes once a second, opposite edge is severed with nothing left to bridge the two halves', () => {
    // mock — same square as above, but sever both the left (s4) and right (s2) edges in turn
    const nodeId = addSquareNode(false);
    const firstNode = store.getState().design.nodes[nodeId] as TVectorNode;

    commitVectorSplit(store.dispatch, firstNode, 's4', 0.5);

    const secondNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const rootOrderBefore = store.getState().design.rootOrder.length;

    // before
    const resultNodeIds = commitVectorSplit(store.dispatch, secondNode, 's2', 0.5);

    // result
    expect(resultNodeIds).toHaveLength(2);
    expect(store.getState().design.rootOrder).toHaveLength(rootOrderBefore + 1);

    resultNodeIds.forEach((id) => {
      const resultNode = store.getState().design.nodes[id] as TVectorNode;

      expect(Object.keys(resultNode.vertices)).toHaveLength(4);
      expect(Object.keys(resultNode.segments)).toHaveLength(3);
    });
  });

  it('should lose the fill on both halves once the loop is cut open on two sides with no chord to close it', () => {
    // mock — a filled square, severed on both the left and right edges like the previous case
    const nodeId = addSquareNode(true);
    const firstNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(firstNode.filledFaceKeys.length).toBeGreaterThan(0);

    commitVectorSplit(store.dispatch, firstNode, 's4', 0.5);

    const secondNode = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    const resultNodeIds = commitVectorSplit(store.dispatch, secondNode, 's2', 0.5);

    // result — neither open half still traces the original closed loop, so fill cannot survive on either
    resultNodeIds.forEach((id) => {
      const resultNode = store.getState().design.nodes[id] as TVectorNode;

      expect(resultNode.filledFaceKeys).toEqual([]);
    });
  });

  it('should bake a rotated node’s geometry to world space before splitting it into two nodes, resetting rotation on both', () => {
    // mock — the same square, rotated 90deg around its own center
    const nodeId = addSquareNode(false, 90);
    const firstNode = store.getState().design.nodes[nodeId] as TVectorNode;

    commitVectorSplit(store.dispatch, firstNode, 's4', 0.5);

    const secondNode = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    const resultNodeIds = commitVectorSplit(store.dispatch, secondNode, 's2', 0.5);

    // result
    expect(resultNodeIds).toHaveLength(2);

    resultNodeIds.forEach((id) => {
      const resultNode = store.getState().design.nodes[id] as TVectorNode;

      expect(resultNode.rotation).toBe(0);
    });
  });
});
