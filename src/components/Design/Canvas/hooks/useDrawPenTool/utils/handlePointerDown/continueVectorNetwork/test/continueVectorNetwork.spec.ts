import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { continueVectorNetwork } from '../continueVectorNetwork';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });
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

describe('continueVectorNetwork', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should close the loop onto an existing vertex when clicking near it, clearing penActiveVertexId', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — click right on v2
    continueVectorNetwork(
      { x: 100, y: 100 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const [segment] = Object.values(updatedNode.segments);

    expect(segment).toMatchObject({ endId: 'v2', startId: 'v1' });
    expect(Object.keys(updatedNode.vertices)).toEqual(['v1', 'v2']);
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
  });

  it('should add a new vertex and segment, keep drawing, when clicking away from any existing vertex', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    continueVectorNetwork(
      { x: 500, y: 500 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(newVertexId).not.toBeNull();
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 500, y: 500 });

    const [segment] = Object.values(updatedNode.segments);

    expect(segment).toMatchObject({ endId: newVertexId, startId: 'v1' });
    expect(dragOriginRef.current).toMatchObject({ nodeId, vertexId: newVertexId });
    expect(dragStartRef.current).toEqual({ x: 500, y: 500 });
  });

  it('should carry the pending outgoing tangent into the new segment when it matches the active vertex', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 5, y: 5 }, vertexId: 'v1' });

    // before
    continueVectorNetwork(
      { x: 500, y: 500 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      createDragOriginRef(),
      createDragStartRef(),
      pendingOutgoingTangentRef,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const [segment] = Object.values(updatedNode.segments);

    expect(segment.tangentStart).toEqual({ x: 5, y: 5 });
  });
});
