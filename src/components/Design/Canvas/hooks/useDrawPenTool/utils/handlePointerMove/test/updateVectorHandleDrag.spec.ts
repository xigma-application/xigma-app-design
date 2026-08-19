import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPendingOutgoingTangent } from '../../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { updateVectorHandleDrag } from '../updateVectorHandleDrag';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });
const createPenDraggedHandlePositionRef = (): RefObject<{ x: number; y: number } | null> => ({ current: null });

const addVectorNodeWithSegment = (): string => {
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
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('updateVectorHandleDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should do nothing while the drag distance is below the minimum threshold', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();

    // before — 1 world unit of movement, well under the threshold
    updateVectorHandleDrag(
      { x: 1, y: 0 },
      { nodeId, segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
    );

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(penDraggedHandlePositionRef.current).toBeNull();
  });

  it('should set the tangent on the origin segment, record the pending outgoing tangent, and track the live cursor position once past the threshold', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();

    // before
    updateVectorHandleDrag(
      { x: 20, y: 5 },
      { nodeId, segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
    );

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toEqual({ x: -20, y: -5 });
    expect(node.vertexHandleModes.v1).toBe('smooth');
    expect(pendingOutgoingTangentRef.current).toEqual({ tangent: { x: 20, y: 5 }, vertexId: 'v1' });
    expect(penDraggedHandlePositionRef.current).toEqual({ x: 20, y: 5 });
  });

  it('should record the pending outgoing tangent and live cursor position without touching any segment when dragging a fresh vertex with no segmentId yet', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();

    // before
    updateVectorHandleDrag(
      { x: 0, y: 20 },
      { nodeId, segmentId: null, vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
    );

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toBeNull();
    expect(pendingOutgoingTangentRef.current).toEqual({ tangent: { x: 0, y: 20 }, vertexId: 'v1' });
    expect(penDraggedHandlePositionRef.current).toEqual({ x: 0, y: 20 });
  });

  it('should do nothing when the drag origin points at a node that no longer exists', () => {
    // mock
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();

    // before
    updateVectorHandleDrag(
      { x: 20, y: 5 },
      { nodeId: 'missing-node', segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
    );

    // result
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(penDraggedHandlePositionRef.current).toBeNull();
  });
});
