import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { updateVectorPenPreview } from '../updateVectorPenPreview';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
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

const createPenPreviewRef = (): TCanvasRefs['penPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): TCanvasRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});

describe('updateVectorPenPreview', () => {
  it('should clear the rubber-band preview when there is no active vertex', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();

    // before
    const hoverKind = updateVectorPenPreview(
      { x: 900, y: 900 },
      node,
      null,
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
    );

    // result
    expect(penPreviewRef.current).toBeNull();
    expect(hoverKind).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
  });

  it('should draw the rubber-band preview from the active vertex to the pointer when no vertex is hovered', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();

    // before
    const hoverKind = updateVectorPenPreview(
      { x: 500, y: 500 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
    );

    // result
    expect(penPreviewRef.current).toEqual({ from: { id: 'v1', x: 0, y: 0 }, tangentFromOffset: null, to: { x: 500, y: 500 } });
    expect(hoverKind).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
  });

  it('should snap the rubber-band preview endpoint to the hovered vertex instead of the raw pointer position', () => {
    // mock
    const nodeWithTwoVertices: TVectorNode = { ...node, vertices: { ...node.vertices, v2: { id: 'v2', x: 100, y: 0 } } };
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();

    // before — active vertex is v1, pointer hovers right on v2
    const hoverKind = updateVectorPenPreview(
      { x: 100, y: 0 },
      nodeWithTwoVertices,
      'v1',
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'v2', x: 100, y: 0 } });
    expect(hoverKind).toBe('vertex');
    expect(hoveredSegmentIdRef.current).toBeNull();
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

    // before — active vertex is v3, pointer hovers near the far end of s1, well outside the midpoint's snap radius
    const hoverKind = updateVectorPenPreview(
      { x: 90, y: 2 },
      nodeWithSegment,
      'v3',
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 90, y: 0 } });
    expect(hoverKind).toBe('edge');
    expect(hoveredSegmentIdRef.current).toBe('s1');
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

    // before — active vertex is v3, pointer hovers a couple of px off s1's midpoint (50,0)
    const hoverKind = updateVectorPenPreview(
      { x: 50, y: 2 },
      nodeWithSegment,
      'v3',
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 50, y: 0 } });
    expect(hoverKind).toBe('edge-snap');
    expect(hoveredSegmentIdRef.current).toBe('s1');
  });

  it('should never snap onto the active vertex itself, even when hovering right on top of it', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();

    // before — active vertex is v1, pointer hovers right on v1 too
    const hoverKind = updateVectorPenPreview(
      { x: 0, y: 0 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      hoveredSegmentIdRef,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 0, y: 0 } });
    expect(hoverKind).toBeNull();
  });

  it('should carry the pending outgoing tangent into the preview when it matches the active vertex', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 5, y: 5 }, vertexId: 'v1' });

    // before
    updateVectorPenPreview(
      { x: 500, y: 500 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      penPreviewRef,
      pendingOutgoingTangentRef,
      hoveredSegmentIdRef,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ tangentFromOffset: { x: 5, y: 5 } });
  });
});
