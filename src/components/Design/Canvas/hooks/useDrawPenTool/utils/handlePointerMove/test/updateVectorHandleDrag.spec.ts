import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorEditRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { updateVectorHandleDrag } from '../updateVectorHandleDrag';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });
const createPenDraggedHandlePositionRef = (): RefObject<{ x: number; y: number } | null> => ({ current: null });
const createPenDraggedHandleIsSnappedRef = (): RefObject<boolean> => ({ current: false });
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({ current: null });

const addVectorNodeWithSegment = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
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

describe('updateVectorHandleDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing while the drag distance is below the minimum threshold', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();

    // before — 1 world unit of movement, well under the threshold
    updateVectorHandleDrag(
      { x: 1, y: 0 },
      { nodeId, segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      false,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(penDraggedHandlePositionRef.current).toBeNull();
    expect(penDraggedHandleIsSnappedRef.current).toBe(false);
  });

  it('should set the tangent on the origin segment, mark the vertex symmetric so future edits mirror both angle and length, record the pending outgoing tangent, and track the live cursor position once past the threshold — angle well outside the snap tolerance, so the raw drag is used unchanged', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();

    // before — atan2(5, 20) ≈ 14deg, outside the 5deg tolerance
    updateVectorHandleDrag(
      { x: 20, y: 5 },
      { nodeId, segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      false,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toEqual({ x: -20, y: -5 });
    expect(node.vertexHandleModes.v1).toBe('symmetric');
    expect(pendingOutgoingTangentRef.current).toEqual({ tangent: { x: 20, y: 5 }, vertexId: 'v1' });
    expect(penDraggedHandlePositionRef.current).toEqual({ x: 20, y: 5 });
    expect(penDraggedHandleIsSnappedRef.current).toBe(false);
  });

  it('should snap the tangent onto the exact axis and flag it when the drag angle is within tolerance', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();

    // before — a couple of px off horizontal, within the angle-snap tolerance
    updateVectorHandleDrag(
      { x: 20, y: 1 },
      { nodeId, segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      false,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createVectorAlignmentGuideRef(),
    );

    // result — pulled onto the exact horizontal axis (y locked to 0), mirrored onto the incoming segment
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toEqual({ x: -20, y: 0 });
    expect(pendingOutgoingTangentRef.current).toEqual({ tangent: { x: 20, y: 0 }, vertexId: 'v1' });
    expect(penDraggedHandlePositionRef.current).toEqual({ x: 20, y: 0 });
    expect(penDraggedHandleIsSnappedRef.current).toBe(true);
  });

  it('should snap the tangent onto the exact vertical axis, normalizing the locked x component to positive zero', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();

    // before — a couple of degrees off vertical, within the angle-snap tolerance
    updateVectorHandleDrag(
      { x: 1, y: 20 },
      { nodeId, segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      false,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createVectorAlignmentGuideRef(),
    );

    // result — x locked to 0, negated back to positive zero rather than -0
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toEqual({ x: 0, y: -20 });
    expect(Object.is(node.segments.s1.tangentEnd?.x, -0)).toBe(false);
    expect(penDraggedHandleIsSnappedRef.current).toBe(true);
  });

  it('should hard-constrain the tangent to the nearest 15deg increment when Shift is held, deflecting it off the raw drag point', () => {
    // mock — atan2(12, 20) ≈ 31deg, closest to the 30deg increment, well outside the plain snap's
    // 4-cardinal-only reach
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();

    // before — Shift held
    updateVectorHandleDrag(
      { x: 20, y: 12 },
      { nodeId, segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      true,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createVectorAlignmentGuideRef(),
    );

    // result — deflected off the raw (20,12), always flagged snapped under the hard constraint
    expect(penDraggedHandlePositionRef.current).not.toEqual({ x: 20, y: 12 });
    expect(penDraggedHandleIsSnappedRef.current).toBe(true);
  });

  it('should record the pending outgoing tangent and live cursor position without touching any segment when dragging a fresh vertex with no segmentId yet', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();

    // before
    updateVectorHandleDrag(
      { x: 0, y: 20 },
      { nodeId, segmentId: null, vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      false,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toBeNull();
    expect(pendingOutgoingTangentRef.current).toEqual({ tangent: { x: 0, y: 20 }, vertexId: 'v1' });
    expect(penDraggedHandlePositionRef.current).toEqual({ x: 0, y: 20 });
  });

  it('should do nothing when the drag origin points at a node that no longer exists', () => {
    // mock
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();

    // before
    updateVectorHandleDrag(
      { x: 20, y: 5 },
      { nodeId: 'missing-node', segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      false,
      store.dispatch,
      store,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(penDraggedHandlePositionRef.current).toBeNull();
    expect(penDraggedHandleIsSnappedRef.current).toBe(false);
  });
});
