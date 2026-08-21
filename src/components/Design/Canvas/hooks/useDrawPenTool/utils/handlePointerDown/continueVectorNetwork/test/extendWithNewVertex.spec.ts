import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { extendWithNewVertex } from '../extendWithNewVertex';

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
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('extendWithNewVertex', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should add a new vertex and segment from the active vertex, activate it, and arm the drag', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 1, y: 1 }, vertexId: 'v1' });

    // before
    extendWithNewVertex(
      { x: 50, y: 50 },
      node,
      'v1',
      'segment-1',
      null,
      store.dispatch,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 50 });
    expect(updatedNode.segments['segment-1']).toMatchObject({ endId: newVertexId, startId: 'v1' });
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: 'segment-1', vertexId: newVertexId });
    expect(dragStartRef.current).toEqual({ x: 50, y: 50 });
    expect(pendingOutgoingTangentRef.current).toBeNull();
  });

  it('should carry the given tangentStart onto the new segment', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    extendWithNewVertex(
      { x: 50, y: 50 },
      node,
      'v1',
      'segment-1',
      { x: 5, y: 5 },
      store.dispatch,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updatedNode.segments['segment-1'].tangentStart).toEqual({ x: 5, y: 5 });
  });
});
