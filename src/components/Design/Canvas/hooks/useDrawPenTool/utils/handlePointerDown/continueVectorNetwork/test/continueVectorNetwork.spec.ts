import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorEditRefs } from 'types/design/canvas/types';
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
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({ current: null });

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
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addVectorNodeWithEdge = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v3', id: 's1', startId: 'v2', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 200, y: 0 }, v3: { id: 'v3', x: 300, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorNetwork', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should close the loop onto an existing vertex when clicking near it, clearing penActiveVertexId and arming a drag on the closing segment', () => {
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
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const [segment] = Object.values(updatedNode.segments);

    expect(segment).toMatchObject({ endId: 'v2', startId: 'v1' });
    expect(Object.keys(updatedNode.vertices)).toEqual(['v1', 'v2']);
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: segment.id, vertexId: 'v2' });
    expect(dragStartRef.current).toEqual({ x: 100, y: 100 });
  });

  it('should arm the drag on the active vertex itself, without adding any vertex/segment, when clicking exactly on it', () => {
    // mock — the active vertex (the one you're currently extending from) is otherwise excluded from
    // getVectorVertexAtPoint's hover match (it can't close a loop onto itself), so clicking right back on
    // it used to fall through to "extend with a new vertex" at the same coordinates as a degenerate
    // zero-length segment; it should instead let you (re)shape its pending outgoing tangent
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — click right on v1, the active vertex itself
    continueVectorNetwork(
      { x: 0, y: 0 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updatedNode.vertices)).toEqual(['v1', 'v2']);
    expect(Object.keys(updatedNode.segments)).toHaveLength(0);
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: null, vertexId: 'v1' });
    expect(dragStartRef.current).toEqual({ x: 0, y: 0 });
  });

  it("should NOT mirror into the active vertex's own incoming segment on a plain (non-Ctrl) click-drag, even when that segment already exists — the already-committed segment stays straight, only the vertex's own pending outgoing tangent (for whatever gets drawn next) is shaped", () => {
    // mock — v3 is the active vertex and also s1's endId (v2 -> v3 already committed); a plain drag from
    // v3 must not bend s1, only Ctrl/Cmd+drag is allowed to do that (see the Ctrl case below)
    const nodeId = addVectorNodeWithEdge();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — click right on v3(300,0), the active vertex itself, no Ctrl held
    continueVectorNetwork(
      { x: 300, y: 0 },
      node,
      'v3',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );

    // result
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: null, vertexId: 'v3' });
    expect(dragStartRef.current).toEqual({ x: 300, y: 0 });
  });

  it("should arm the drag on the active vertex's own incoming segment when Ctrl/Cmd is held while clicking exactly on it and that segment already exists — so dragging the outgoing tangent mirrors into the incoming one instead of leaving it a no-op", () => {
    // mock — same setup as above, but with Ctrl held: v3 is the active vertex and also s1's endId
    // (v2 -> v3 already committed); clicking back on v3 itself must find s1 as the incoming segment to
    // mirror-shape, not fall back to segmentId: null
    const nodeId = addVectorNodeWithEdge();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — Ctrl+click right on v3(300,0), the active vertex itself
    continueVectorNetwork(
      { x: 300, y: 0 },
      node,
      'v3',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      true,
      false,
    );

    // result
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: 's1', vertexId: 'v3' });
    expect(dragStartRef.current).toEqual({ x: 300, y: 0 });
  });

  it('should keep segmentId null when Ctrl/Cmd is held but the active vertex has no incoming segment to mirror into', () => {
    // mock — v1 is the active vertex and the very first vertex of the network, so it has no incoming
    // segment at all yet; Ctrl being held must not change that — there's nothing to mirror into
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — Ctrl+click right on v1(0,0), the active vertex itself
    continueVectorNetwork(
      { x: 0, y: 0 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      true,
      false,
    );

    // result
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: null, vertexId: 'v1' });
    expect(dragStartRef.current).toEqual({ x: 0, y: 0 });
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
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
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

  it('should snap the new vertex onto the exact horizontal axis when clicking within the angle-snap tolerance of the active vertex', () => {
    // mock — a couple of px off horizontal from v1(0,0), within the angle-snap tolerance
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    continueVectorNetwork(
      { x: 500, y: 5 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );

    // result — pulled exactly onto v1's own y, not the raw clicked y
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(updatedNode.vertices[newVertexId].y).toBe(0);
  });

  it('should hard-constrain the new vertex to the nearest 15deg increment when Shift is held, even at an angle the plain (no-Shift) snap would never attract to', () => {
    // mock — a point placed exactly on a 30deg ray from v1(0,0) at distance 300, well outside the
    // plain snap's 4-cardinal-only reach — Shift's 15deg increments include 30deg exactly, so this
    // should commit right where it was clicked (its own angle already lands on a candidate)
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const radians = (30 * Math.PI) / 180;
    const clickPoint = { x: 300 * Math.cos(radians), y: 300 * Math.sin(radians) };

    // before — Shift held
    continueVectorNetwork(
      clickPoint,
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      true,
    );

    // result — lands on the same 30deg ray (within half-pixel rounding), not deflected off it
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;
    const placed = updatedNode.vertices[newVertexId];

    expect(placed.x).toBeCloseTo(clickPoint.x, 0);
    expect(placed.y).toBeCloseTo(clickPoint.y, 0);
  });

  it('should hard-constrain a diagonal click to the nearest 15deg increment when Shift is held, deflecting it off the raw clicked point', () => {
    // mock — a point at atan2(202,300) ≈ 33.98deg from v1(0,0) — closest to the 30deg candidate, so
    // Shift should deflect the commit off the raw click, unlike a plain (no-Shift) click which would
    // commit at the exact raw point since it's nowhere near a cardinal direction
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — Shift held
    continueVectorNetwork(
      { x: 300, y: 202 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      true,
    );

    // result — deflected off the raw y=202, not committed straight through
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(updatedNode.vertices[newVertexId].y).not.toBe(202);
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
      store,
      createDragOriginRef(),
      createDragStartRef(),
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const [segment] = Object.values(updatedNode.segments);

    expect(segment.tangentStart).toEqual({ x: 5, y: 5 });
  });

  it('should split the edge and connect the active vertex to the new split point when clicking on an existing segment — attaching the in-progress line to the network, and arm a drag on the connecting segment so a click-drag onto the split point can also shape it', () => {
    // mock — v1(0,0) is being extended, v2(200,0)-v3(300,0) is an existing segment elsewhere on the node
    const nodeId = addVectorNodeWithEdge();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — click the midpoint of the v2-v3 edge
    continueVectorNetwork(
      { x: 250, y: 0 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = updatedNode.segments.s1.endId;

    expect(newVertexId).not.toBe('v2');
    expect(newVertexId).not.toBe('v3');
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 250, y: 0 });

    const connectingSegment = Object.values(updatedNode.segments).find((segment) => segment.startId === 'v1');

    expect(connectingSegment).toMatchObject({ endId: newVertexId, startId: 'v1' });
    expect(store.getState().design.penActiveVertexId).toBeNull();
    // the drag is armed on the connecting segment and the new split vertex, mirroring closeLoopOntoVertex —
    // a click-drag onto the split point shapes its tangent instead of only ever committing a straight join
    expect(dragOriginRef.current).toEqual({ nodeId, segmentId: connectingSegment?.id, vertexId: newVertexId });
    expect(dragStartRef.current).toEqual({ x: 250, y: 0 });
  });

  it('should snap the committed vertex onto an alignment guide with a vertex on a completely separate vector node, then clear the guide ref', () => {
    // mock — a second, unrelated vector node has a vertex at x=500, well within alignment tolerance of
    // the click's own x — the committed point should snap onto that column instead of the raw click x
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

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
        vertices: { a: { id: 'a', x: 500, y: 900 } },
      }),
    );

    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();
    const vectorAlignmentGuideRef = createVectorAlignmentGuideRef();

    vectorAlignmentGuideRef.current = {
      horizontal: null,
      vertical: { anchor: { x: 999, y: 999 }, match: { x: 999, y: 999 } },
    };

    // before — click a couple of px off x=500, well outside cardinal angle-snap tolerance from v1(0,0)
    continueVectorNetwork(
      { x: 502, y: 350 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      vectorAlignmentGuideRef,
      false,
      false,
    );

    // result — snapped onto x=500, and the guide ref is cleared once the point actually commits
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(updatedNode.vertices[newVertexId].x).toBe(500);
    expect(vectorAlignmentGuideRef.current).toBeNull();
  });

  it('should merge into another open node when clicking its vertex, absorbing it into the node being extended', () => {
    // mock — v1 on node A is being extended and closes directly onto vb on the other open node, B
    const sourceId = addVectorNode();

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
        vertices: { vb: { id: 'vb', x: 500, y: 500 } },
      }),
    );

    const { rootOrder } = store.getState().design;
    const targetId = rootOrder[rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const node = store.getState().design.nodes[sourceId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — click right on vb
    continueVectorNetwork(
      { x: 500, y: 500 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );

    // result
    const state = store.getState();
    const updatedSource = state.design.nodes[sourceId] as TVectorNode;

    expect(state.design.nodes[targetId]).toBeUndefined();
    expect(updatedSource.vertices).toHaveProperty('vb');
    expect(state.design.vectorEditingNodeIds).toEqual([sourceId]);
    expect(dragOriginRef.current).toEqual({ nodeId: sourceId, segmentId: expect.any(String), vertexId: 'vb' });
    expect(dragStartRef.current).toEqual({ x: 500, y: 500 });
  });

  it('should split and merge into another open node when clicking its edge, absorbing it into the node being extended', () => {
    // mock — v1 on node A is being extended and closes onto the midpoint of an edge on the other open node, B
    const sourceId = addVectorNode();

    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { sb: { endId: 'vb2', id: 'sb', startId: 'vb1', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { vb1: { id: 'vb1', x: 500, y: 0 }, vb2: { id: 'vb2', x: 500, y: 100 } },
      }),
    );

    const { rootOrder } = store.getState().design;
    const targetId = rootOrder[rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const node = store.getState().design.nodes[sourceId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before — click the midpoint of the vb1-vb2 edge
    continueVectorNetwork(
      { x: 500, y: 50 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );

    // result
    const state = store.getState();
    const updatedSource = state.design.nodes[sourceId] as TVectorNode;
    const newVertexId = updatedSource.segments.sb.endId;

    expect(state.design.nodes[targetId]).toBeUndefined();
    expect(newVertexId).not.toBe('vb1');
    expect(newVertexId).not.toBe('vb2');
    expect(updatedSource.vertices[newVertexId]).toEqual({ id: newVertexId, x: 500, y: 50 });
    expect(state.design.vectorEditingNodeIds).toEqual([sourceId]);
    expect(dragStartRef.current).toEqual({ x: 500, y: 50 });
  });
});
