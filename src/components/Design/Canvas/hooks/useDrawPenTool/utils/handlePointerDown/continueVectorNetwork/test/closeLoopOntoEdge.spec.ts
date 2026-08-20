import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPendingOutgoingTangent } from '../../../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { closeLoopOntoEdge } from '../closeLoopOntoEdge';

const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('closeLoopOntoEdge', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId('v3'));
  });

  it('should split the edge, connect the active vertex to the new split point, clear the active vertex, and end the history gesture', () => {
    // mock — v3 is being actively extended, and lands on the midpoint of the v1-v2 edge
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 1, y: 1 }, vertexId: 'v3' });

    // before — t=0.5 along the straight v1(0,0)-v2(100,0) edge lands exactly on its midpoint
    closeLoopOntoEdge(node, 'v3', 's1', 0.5, 'segment-connect', null, store.dispatch, pendingOutgoingTangentRef);

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = updatedNode.segments.s1.endId;

    expect(newVertexId).not.toBe('v1');
    expect(newVertexId).not.toBe('v2');
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
    expect(updatedNode.segments['segment-connect']).toMatchObject({ endId: newVertexId, startId: 'v3', tangentStart: null });
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
  });

  it('should carry the given tangentStart onto the connecting segment', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    closeLoopOntoEdge(node, 'v3', 's1', 0.5, 'segment-connect', { x: 5, y: 5 }, store.dispatch, createPendingOutgoingTangentRef());

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updatedNode.segments['segment-connect'].tangentStart).toEqual({ x: 5, y: 5 });
  });
});
