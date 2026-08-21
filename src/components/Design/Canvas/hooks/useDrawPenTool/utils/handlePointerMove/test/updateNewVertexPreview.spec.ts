// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { updateNewVertexPreview } from '../updateNewVertexPreview';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

const createPenNewVertexPreviewRef = (): TCanvasRefs['penNewVertexPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): TCanvasRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPenHoveredDragArmableVertexRef = (): TCanvasRefs['penHoveredDragArmableVertexRef'] => ({ current: false });

describe('updateNewVertexPreview', () => {
  it('should preview the raw pointer position and clear the hovered segment when there is no node to snap against', () => {
    // mock
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before
    const hoverKind = updateNewVertexPreview(
      { x: 900, y: 900 },
      null,
      IDENTITY_VIEWPORT,
      penNewVertexPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ x: 900, y: 900 });
    expect(hoverKind).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should preview the raw pointer position when no resolver matches', () => {
    // mock
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before
    const hoverKind = updateNewVertexPreview(
      { x: 900, y: 900 },
      node,
      IDENTITY_VIEWPORT,
      penNewVertexPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ x: 900, y: 900 });
    expect(hoverKind).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should apply the vertex resolver, flag the hover as drag-armable, and stop checking the rest when hovering close enough to an existing vertex', () => {
    // mock — resuming any existing vertex now arms a click-drag to shape a fresh outgoing tangent
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — pointer hovers a couple of px away from v1, well within the snap radius
    const hoverKind = updateNewVertexPreview(
      { x: 2, y: 1 },
      node,
      IDENTITY_VIEWPORT,
      penNewVertexPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ id: 'v1', x: 0, y: 0 });
    expect(hoverKind).toBe('vertex');
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(true);
  });

  it('should fall through to the edge resolver, attracting the preview and reporting the hovered segment, when no vertex matches', () => {
    // mock
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — pointer hovers near the far end of s1 (v1 0,0 -> v2 100,0), well outside the midpoint's snap radius
    const hoverKind = updateNewVertexPreview(
      { x: 90, y: 2 },
      node,
      IDENTITY_VIEWPORT,
      penNewVertexPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ x: 90, y: 0 });
    expect(hoverKind).toBe('edge');
    expect(hoveredSegmentIdRef.current).toBe('s1');
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should lock onto the exact midpoint and report the edge-snap hover kind when hovering close enough to it', () => {
    // mock
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before — pointer hovers a couple of px off s1's midpoint (v1 0,0 -> v2 100,0 -> midpoint 50,0)
    const hoverKind = updateNewVertexPreview(
      { x: 50, y: 2 },
      node,
      IDENTITY_VIEWPORT,
      penNewVertexPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ x: 50, y: 0 });
    expect(hoverKind).toBe('edge-snap');
    expect(hoveredSegmentIdRef.current).toBe('s1');
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should clear a previously hovered segment once the pointer moves off it', () => {
    // mock
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    hoveredSegmentIdRef.current = 's1';

    // before
    const hoverKind = updateNewVertexPreview(
      { x: 900, y: 900 },
      node,
      IDENTITY_VIEWPORT,
      penNewVertexPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
    );

    // result
    expect(hoverKind).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
  });
});
