import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../../../types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { updateVectorPenPreview } from '../updateVectorPenPreview';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 } },
};

const nodes: Record<string, TSceneNode> = { [node.id]: node };

const createPenPreviewRef = (): TCanvasRefs['penPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): TCanvasRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPenHoveredDragArmableVertexRef = (): TCanvasRefs['penHoveredDragArmableVertexRef'] => ({ current: false });
const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});
const createVectorAlignmentGuideRef = (): TCanvasRefs['vectorAlignmentGuideRef'] => ({ current: null });

describe('updateVectorPenPreview', () => {
  it('should clear the rubber-band preview when there is no active vertex', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before
    const hoverKind = updateVectorPenPreview(
      { x: 900, y: 900 },
      node,
      nodes,
      null,
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(penPreviewRef.current).toBeNull();
    expect(hoverKind).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should draw the rubber-band preview from the active vertex to the pointer when no vertex is hovered', () => {
    // mock — 45deg, well outside the angle-snap tolerance
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before
    const hoverKind = updateVectorPenPreview(
      { x: 500, y: 500 },
      node,
      nodes,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(penPreviewRef.current).toEqual({
      from: { id: 'v1', x: 0, y: 0 },
      isSnapped: false,
      tangentFromOffset: null,
      to: { x: 500, y: 500 },
    });
    expect(hoverKind).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should snap the rubber-band preview onto the nearest cardinal direction and flag it, when the pointer is within the angle tolerance', () => {
    // mock — a couple of px off horizontal from v1(0,0), within the snap tolerance
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before
    updateVectorPenPreview(
      { x: 500, y: 5 },
      node,
      nodes,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result — pulled onto the exact horizontal axis
    expect(penPreviewRef.current?.isSnapped).toBe(true);
    expect(penPreviewRef.current?.to.y).toBeCloseTo(0);
  });

  it('should hard-constrain the rubber-band preview to the nearest 15deg increment when Shift is held, deflecting it off an angle the plain snap ignores', () => {
    // mock — atan2(12, 20) ≈ 31deg, closest to the 30deg increment
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — Shift held
    updateVectorPenPreview(
      { x: 20, y: 12 },
      node,
      nodes,
      'v1',
      IDENTITY_VIEWPORT,
      true,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(penPreviewRef.current?.isSnapped).toBe(true);
    expect(penPreviewRef.current?.to).not.toEqual({ x: 20, y: 12 });
  });

  it('should snap the rubber-band preview endpoint to the hovered vertex instead of the raw pointer position', () => {
    // mock
    const nodeWithTwoVertices: TVectorNode = { ...node, vertices: { ...node.vertices, v2: { id: 'v2', x: 100, y: 0 } } };
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — active vertex is v1, pointer hovers right on v2
    const hoverKind = updateVectorPenPreview(
      { x: 100, y: 0 },
      nodeWithTwoVertices,
      nodes,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result — closing onto a *different* vertex mid-fragment is drag-armable too: a click-drag there
    // shapes the closing segment's own tangentEnd (closeLoopOntoVertex.ts)
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'v2', x: 100, y: 0 } });
    expect(hoverKind).toBe('vertex');
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(true);
  });

  it('should attract the rubber-band preview endpoint onto a hovered segment and report it as hovered, closing-onto-an-edge style', () => {
    // mock — a committed segment s1 from v1(0,0) to v2(100,0), extending from a third active vertex v3
    const nodeWithSegment: TVectorNode = {
      ...node,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    };
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — active vertex is v3, pointer hovers near the far end of s1, well outside the midpoint's snap radius
    const hoverKind = updateVectorPenPreview(
      { x: 90, y: 2 },
      nodeWithSegment,
      nodes,
      'v3',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 90, y: 0 } });
    expect(hoverKind).toBe('edge');
    expect(hoveredSegmentIdRef.current).toBe('s1');
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should lock the rubber-band preview endpoint onto the exact midpoint and report edge-snap when hovering close enough to it', () => {
    // mock — same setup, extending from v3 toward s1's midpoint
    const nodeWithSegment: TVectorNode = {
      ...node,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    };
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — active vertex is v3, pointer hovers a couple of px off s1's midpoint (50,0)
    const hoverKind = updateVectorPenPreview(
      { x: 50, y: 2 },
      nodeWithSegment,
      nodes,
      'v3',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 50, y: 0 } });
    expect(hoverKind).toBe('edge-snap');
    expect(hoveredSegmentIdRef.current).toBe('s1');
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should snap onto the active vertex itself and flag the hover as drag-armable when hovering right on top of it', () => {
    // mock — pressing here now arms a click-drag to (re)shape this vertex's own outgoing tangent
    // (continueVectorNetwork.ts's isPointNearVertex check), so the hover/preview layer must show the
    // same affordance instead of silently falling through to the raw, unsnapped pointer position
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — active vertex is v1, pointer hovers right on v1 too
    const hoverKind = updateVectorPenPreview(
      { x: 0, y: 0 },
      node,
      nodes,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(penPreviewRef.current).toEqual({
      from: { id: 'v1', x: 0, y: 0 },
      isSnapped: false,
      tangentFromOffset: null,
      to: { id: 'v1', x: 0, y: 0 },
    });
    expect(hoverKind).toBe('active-vertex');
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(true);
  });

  it('should carry the pending outgoing tangent into the preview when it matches the active vertex', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 5, y: 5 }, vertexId: 'v1' });

    // before
    updateVectorPenPreview(
      { x: 500, y: 500 },
      node,
      nodes,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      pendingOutgoingTangentRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ tangentFromOffset: { x: 5, y: 5 } });
  });

  it('should attract the rubber-band preview onto a vertex on another open node, and report it as not drag-armable', () => {
    // mock — node's own vertex is far from the pointer, so its own resolvers find nothing; the other
    // open node has a vertex right where the pointer is hovering
    const otherNode: TVectorNode = {
      ...node,
      id: 'vector-2',
      vertices: { vb: { id: 'vb', x: 500, y: 500 } },
    };
    const nodesWithOther: Record<string, TSceneNode> = { ...nodes, [otherNode.id]: otherNode };
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — active vertex is v1 on the main node, pointer hovers right on vb on the other open node
    const hoverKind = updateVectorPenPreview(
      { x: 500, y: 500 },
      node,
      nodesWithOther,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
      [otherNode.id],
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'vb', x: 500, y: 500 } });
    expect(hoverKind).toBe('vertex');
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should skip a stale other-open-node id that no longer resolves to a vector node', () => {
    // mock — otherOpenNodeIds carries an id that isn't in the nodes map at all; the loop must skip it
    // and fall through to the plain angle-snap preview instead of throwing
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before
    const hoverKind = updateVectorPenPreview(
      { x: 500, y: 500 },
      node,
      nodes,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
      ['missing-node'],
    );

    // result
    expect(hoverKind).toBeNull();
    expect(penPreviewRef.current).toMatchObject({ to: { x: 500, y: 500 } });
  });
});
