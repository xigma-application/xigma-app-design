import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { closeLoopOntoVertex } from '../closeLoopOntoVertex';

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

describe('closeLoopOntoVertex', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId('v1'));
  });

  it('should connect the active vertex to the target vertex, clear the active vertex, and arm a drag on the closing segment', () => {
    // mock — arming the drag lets a click-drag onto the target vertex also shape the closing segment's
    // tangentEnd, instead of only ever committing a straight closing segment
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 1, y: 1 }, vertexId: 'v1' });

    // before
    closeLoopOntoVertex(
      { x: 100, y: 100 },
      node,
      'v1',
      'v2',
      'segment-1',
      null,
      store.dispatch,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updatedNode.segments['segment-1']).toMatchObject({ endId: 'v2', startId: 'v1', tangentStart: null });
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: 'segment-1', vertexId: 'v2' });
    expect(dragStartRef.current).toEqual({ x: 100, y: 100 });
  });

  it('should carry the given tangentStart onto the closing segment', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    closeLoopOntoVertex(
      { x: 100, y: 100 },
      node,
      'v1',
      'v2',
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

  it('should not create a duplicate segment or arm a drag when the active vertex and target vertex are already directly connected — A -> B -> A must not double the line', () => {
    // mock — v1 -> v2 already connected by s1, then closing back from v2 onto v1
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } } },
        id: nodeId,
      }),
    );

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 1, y: 1 }, vertexId: 'v2' });

    // before
    closeLoopOntoVertex(
      { x: 0, y: 0 },
      node,
      'v2',
      'v1',
      'segment-2',
      null,
      store.dispatch,
      dragOriginRef,
      createDragStartRef(),
      pendingOutgoingTangentRef,
    );

    // result — no new segment added, no segment to arm a drag on either, but the close still finishes
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updatedNode.segments)).toEqual(['s1']);
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(dragOriginRef.current).toBeNull();
  });

  it('should not create a duplicate segment when the existing segment runs in the opposite direction', () => {
    // mock — s1 already runs v2 -> v1; closing from v1 back onto v2 must not add a second, parallel segment
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v1', id: 's1', startId: 'v2', tangentEnd: null, tangentStart: null } } },
        id: nodeId,
      }),
    );

    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    closeLoopOntoVertex(
      { x: 0, y: 0 },
      node,
      'v1',
      'v2',
      'segment-2',
      null,
      store.dispatch,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updatedNode.segments)).toEqual(['s1']);
  });

  it('should not create a duplicate segment when the existing segment already runs in the exact same direction', () => {
    // mock — s1 already runs v1 -> v2, and the active vertex is v1 itself (e.g. resumed via startVectorFragment)
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } } },
        id: nodeId,
      }),
    );

    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    closeLoopOntoVertex(
      { x: 0, y: 0 },
      node,
      'v1',
      'v2',
      'segment-2',
      null,
      store.dispatch,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updatedNode.segments)).toEqual(['s1']);
  });
});
