import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { startVectorFragment } from '../startVectorFragment';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });
const createPendingOutgoingTangentRef = (pending: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: pending,
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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addVectorNodeWithSegment = (): string => {
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
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('startVectorFragment', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should activate the existing vertex, without adding a new one, when clicking near it', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startVectorFragment({ x: 1, y: 1 }, node, IDENTITY_VIEWPORT, store.dispatch, dragOriginRef, dragStartRef, pendingOutgoingTangentRef);

    // result
    expect(store.getState().design.penActiveVertexId).toBe('v1');
    expect(
      Object.keys((store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode).vertices),
    ).toEqual(['v1']);
  });

  it('should arm the drag on the resumed vertex, so click-dragging away from it shapes a fresh outgoing tangent', () => {
    // mock — same click-drag-to-curve capability startNewVectorNetwork/the blank-canvas branch already give a
    // brand-new vertex, now also available when resuming an existing one ("od innego punktu startuje")
    const nodeId = addVectorNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startVectorFragment({ x: 1, y: 1 }, node, IDENTITY_VIEWPORT, store.dispatch, dragOriginRef, dragStartRef, pendingOutgoingTangentRef);

    // result — segmentId: null since there's no incoming segment to mirror-shape from a resumed vertex,
    // mirroring the exact same convention startNewVectorNetwork/the blank-canvas branch already use
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: null, vertexId: 'v1' });
    expect(dragStartRef.current).toEqual({ x: 1, y: 1 });
  });

  it('should clear a stale pending outgoing tangent left over from a fragment ended earlier (e.g. by Escape) when resuming an existing vertex', () => {
    // mock — mirrors interrupting a click-drag curve with Escape, then clicking back onto that same vertex:
    // nothing in this codebase clears pendingOutgoingTangentRef on Escape or on tool switches, so without this
    // reset the resumed vertex would silently inherit the old drag's tangent and instantly render/commit a
    // curve on the very next pointermove/click, even though the user only intended a plain click
    const nodeId = addVectorNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 40, y: 40 }, vertexId: 'v1' });

    // before
    startVectorFragment({ x: 1, y: 1 }, node, IDENTITY_VIEWPORT, store.dispatch, dragOriginRef, dragStartRef, pendingOutgoingTangentRef);

    // result
    expect(pendingOutgoingTangentRef.current).toBeNull();
  });

  it('should add a new vertex and arm the drag when clicking away from any existing vertex', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startVectorFragment({ x: 50, y: 50 }, node, IDENTITY_VIEWPORT, store.dispatch, dragOriginRef, dragStartRef, pendingOutgoingTangentRef);

    // result
    const updatedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(newVertexId).not.toBe('v1');
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 50 });
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: null, vertexId: newVertexId });
    expect(dragStartRef.current).toEqual({ x: 50, y: 50 });
  });

  it('should split the edge and activate the new split point when clicking on an existing segment — starting a fresh branch off it', () => {
    // mock — v1(0,0) to v2(100,0), clicking its midpoint
    const nodeId = addVectorNodeWithSegment();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startVectorFragment({ x: 50, y: 0 }, node, IDENTITY_VIEWPORT, store.dispatch, dragOriginRef, dragStartRef, pendingOutgoingTangentRef);

    // result
    const updatedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(newVertexId).not.toBe('v1');
    expect(newVertexId).not.toBe('v2');
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
    expect(updatedNode.segments.s1).toMatchObject({ endId: newVertexId, startId: 'v1' });
    expect(Object.keys(updatedNode.segments)).toHaveLength(2);
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: null, vertexId: newVertexId });
  });
});
