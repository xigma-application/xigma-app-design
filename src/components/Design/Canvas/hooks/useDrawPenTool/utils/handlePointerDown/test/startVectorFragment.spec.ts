import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { startVectorFragment } from '../startVectorFragment';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });

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
      vertices: { v1: { id: 'v1', x: 0, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

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

describe('startVectorFragment', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should activate the existing vertex, without adding a new one, when clicking near it', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();

    // before
    startVectorFragment({ x: 1, y: 1 }, node, IDENTITY_VIEWPORT, store.dispatch, dragOriginRef, dragStartRef);

    // result
    expect(store.getState().design.penActiveVertexId).toBe('v1');
    expect(Object.keys((store.getState().design.nodes[nodeId] as TVectorNode).vertices)).toEqual(['v1']);
    expect(dragOriginRef.current).toBeNull();
  });

  it('should add a new vertex and arm the drag when clicking away from any existing vertex', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();

    // before
    startVectorFragment({ x: 50, y: 50 }, node, IDENTITY_VIEWPORT, store.dispatch, dragOriginRef, dragStartRef);

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(newVertexId).not.toBe('v1');
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 50 });
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: null, vertexId: newVertexId });
    expect(dragStartRef.current).toEqual({ x: 50, y: 50 });
  });

  it('should split the edge and activate the new split point when clicking on an existing segment — starting a fresh branch off it', () => {
    // mock — v1(0,0) to v2(100,0), clicking its midpoint
    const nodeId = addVectorNodeWithSegment();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();

    // before
    startVectorFragment({ x: 50, y: 0 }, node, IDENTITY_VIEWPORT, store.dispatch, dragOriginRef, dragStartRef);

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(newVertexId).not.toBe('v1');
    expect(newVertexId).not.toBe('v2');
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
    expect(updatedNode.segments.s1).toMatchObject({ endId: newVertexId, startId: 'v1' });
    expect(Object.keys(updatedNode.segments)).toHaveLength(2);
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: null, vertexId: newVertexId });
  });
});
