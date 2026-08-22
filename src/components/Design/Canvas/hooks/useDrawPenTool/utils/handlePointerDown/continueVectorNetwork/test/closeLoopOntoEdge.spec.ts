import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { closeLoopOntoEdge } from '../closeLoopOntoEdge';

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });
const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
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
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId('v3'));
  });

  it('should split the edge, connect the active vertex to the new split point, clear the active vertex, and arm a drag on the connecting segment', () => {
    // mock — v3 is being actively extended, and lands on the midpoint of the v1-v2 edge; arming the drag
    // lets a click-drag onto the split point also shape the connecting segment's tangentEnd, instead of
    // only ever committing a straight connection and ending the gesture outright
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 1, y: 1 }, vertexId: 'v3' });

    // before — t=0.5 along the straight v1(0,0)-v2(100,0) edge lands exactly on its midpoint
    closeLoopOntoEdge(
      { x: 50, y: 0 },
      node,
      'v3',
      's1',
      0.5,
      'segment-connect',
      null,
      store.dispatch,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = updatedNode.segments.s1.endId;

    expect(newVertexId).not.toBe('v1');
    expect(newVertexId).not.toBe('v2');
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
    expect(updatedNode.segments['segment-connect']).toMatchObject({ endId: newVertexId, startId: 'v3', tangentStart: null });
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: 'segment-connect', vertexId: newVertexId });
    expect(dragStartRef.current).toEqual({ x: 50, y: 0 });
  });

  it('should carry the given tangentStart onto the connecting segment', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    closeLoopOntoEdge(
      { x: 50, y: 0 },
      node,
      'v3',
      's1',
      0.5,
      'segment-connect',
      { x: 5, y: 5 },
      store.dispatch,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updatedNode.segments['segment-connect'].tangentStart).toEqual({ x: 5, y: 5 });
  });
});
