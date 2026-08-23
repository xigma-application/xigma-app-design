// store
import { addNode, setSelection, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { markNewVectorCutVertices } from '../markNewVectorCutVertices';

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

describe('markNewVectorCutVertices', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should mark every vertex id present after the cut but not before, for a node that stayed open', () => {
    // mock — snapshot before, then simulate the cut adding two new vertices at the same node id
    const nodeId = addVectorNode();
    const beforeNodes = store.getState().design.nodes;

    store.dispatch(
      updateNode({
        changes: {
          segments: {
            s1a: { endId: 'x1', id: 's1a', startId: 'a', tangentEnd: null, tangentStart: null },
            s1b: { endId: 'b', id: 's1b', startId: 'x2', tangentEnd: null, tangentStart: null },
          },
          vertices: {
            a: { id: 'a', x: 0, y: 0 },
            b: { id: 'b', x: 100, y: 0 },
            x1: { id: 'x1', x: 50, y: 0 },
            x2: { id: 'x2', x: 50, y: 0 },
          },
        },
        id: nodeId,
      }),
    );

    const canvasRefs = createCanvasRefs();

    // before
    markNewVectorCutVertices(canvasRefs, beforeNodes, [nodeId], [nodeId]);

    // result — only the two genuinely new ids, not the two that already existed
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set(['x1', 'x2']));
  });

  it('should accumulate onto whatever was already marked, not replace it', () => {
    // mock
    const nodeId = addVectorNode();
    const beforeNodes = store.getState().design.nodes;

    store.dispatch(
      updateNode({
        changes: { vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, x1: { id: 'x1', x: 50, y: 0 } } },
        id: nodeId,
      }),
    );

    const canvasRefs = createCanvasRefs();

    canvasRefs.newVectorCutVertexIdsRef.current = new Set(['from-an-earlier-cut']);

    // before
    markNewVectorCutVertices(canvasRefs, beforeNodes, [nodeId], [nodeId]);

    // result
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set(['from-an-earlier-cut', 'x1']));
  });

  it('should mark a brand-new sibling node’s own share of new vertices too, not just the original node’s', () => {
    // mock — a cut that genuinely disconnects the network: the original node keeps 'a' and gains 'x1',
    // while a brand-new sibling node (addNode, no counterpart in beforeNodes) gets 'x2' and keeps 'b'
    const nodeId = addVectorNode();
    const beforeNodes = store.getState().design.nodes;

    store.dispatch(
      updateNode({
        changes: {
          segments: { s1a: { endId: 'x1', id: 's1a', startId: 'a', tangentEnd: null, tangentStart: null } },
          vertices: { a: { id: 'a', x: 0, y: 0 }, x1: { id: 'x1', x: 50, y: 0 } },
        },
        id: nodeId,
      }),
    );
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { s1b: { endId: 'b', id: 's1b', startId: 'x2', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { b: { id: 'b', x: 100, y: 0 }, x2: { id: 'x2', x: 50, y: 0 } },
      }),
    );

    const { rootOrder } = store.getState().design;
    const newNodeId = rootOrder[rootOrder.length - 1];
    const canvasRefs = createCanvasRefs();

    // before
    markNewVectorCutVertices(canvasRefs, beforeNodes, [nodeId], [nodeId, newNodeId]);

    // result — x1 and x2 are new, a and b already existed (just redistributed across nodes)
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set(['x1', 'x2']));
  });

  it('should mark nothing for a node id that no longer exists in either scope', () => {
    // mock
    const nodeId = addVectorNode();
    const beforeNodes = store.getState().design.nodes;
    const canvasRefs = createCanvasRefs();

    // before — 'stale-id' was never a real node either before or after
    markNewVectorCutVertices(canvasRefs, beforeNodes, ['stale-id'], ['stale-id']);

    // result
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set());
    void nodeId;
  });

  it('should mark nothing when the vertex set is unchanged', () => {
    // mock
    const nodeId = addVectorNode();
    const beforeNodes = store.getState().design.nodes;
    const canvasRefs = createCanvasRefs();

    // before — no dispatch in between, so before/after are identical
    markNewVectorCutVertices(canvasRefs, beforeNodes, [nodeId], [nodeId]);

    // result
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set());
  });

  it('should mark vertices across several open nodes at once', () => {
    // mock — two independently-open nodes, both gain one new vertex
    const firstNodeId = addVectorNode();
    const secondNodeId = addVectorNode();
    const beforeNodes = store.getState().design.nodes;

    store.dispatch(
      updateNode({
        changes: {
          vertices: { ...(beforeNodes[firstNodeId] as TVectorNode).vertices, extra1: { id: 'extra1', x: 5, y: 5 } },
        },
        id: firstNodeId,
      }),
    );
    store.dispatch(
      updateNode({
        changes: {
          vertices: { ...(beforeNodes[secondNodeId] as TVectorNode).vertices, extra2: { id: 'extra2', x: 6, y: 6 } },
        },
        id: secondNodeId,
      }),
    );

    const canvasRefs = createCanvasRefs();

    // before
    markNewVectorCutVertices(canvasRefs, beforeNodes, [firstNodeId, secondNodeId], [firstNodeId, secondNodeId]);

    // result
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set(['extra1', 'extra2']));
  });
});
