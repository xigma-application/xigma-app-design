import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPendingOutgoingTangent } from '../../../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { closeLoopOntoVertex } from '../closeLoopOntoVertex';

const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('closeLoopOntoVertex', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId('v1'));
  });

  it('should connect the active vertex to the target vertex, clear the active vertex, and end the history gesture', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 1, y: 1 }, vertexId: 'v1' });

    // before
    closeLoopOntoVertex(node, 'v1', 'v2', 'segment-1', null, store.dispatch, pendingOutgoingTangentRef);

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updatedNode.segments['segment-1']).toMatchObject({ endId: 'v2', startId: 'v1', tangentStart: null });
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
  });

  it('should carry the given tangentStart onto the closing segment', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    closeLoopOntoVertex(node, 'v1', 'v2', 'segment-1', { x: 5, y: 5 }, store.dispatch, createPendingOutgoingTangentRef());

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updatedNode.segments['segment-1'].tangentStart).toEqual({ x: 5, y: 5 });
  });
});
