import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../../../types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { resolveActiveVertexPreview } from '../resolveActiveVertexPreview';

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
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

const nodes: Record<string, TSceneNode> = { [node.id]: node };

const createPenPreviewRef = (): TPenRefs['penPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): THoverRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPenHoveredDragArmableVertexRef = (): TPenRefs['penHoveredDragArmableVertexRef'] => ({ current: false });
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({ current: null });
const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});

describe('resolveActiveVertexPreview', () => {
  it('should snap the preview onto a vertex hovered on the same node', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();

    // before — active vertex v1, pointer hovers right on v2
    const hoverKind = resolveActiveVertexPreview(
      { x: 100, y: 0 },
      node,
      nodes,
      node.vertices.v1,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
      [],
    );

    // result
    expect(hoverKind).toBe('vertex');
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'v2', x: 100, y: 0 } });
  });

  it('should fall through to a vertex hovered on another open node when nothing on the own node matches', () => {
    // mock
    const otherNode: TVectorNode = { ...node, id: 'vector-2', vertices: { vb: { id: 'vb', x: 500, y: 500 } } };
    const nodesWithOther: Record<string, TSceneNode> = { ...nodes, [otherNode.id]: otherNode };
    const penPreviewRef = createPenPreviewRef();

    // before
    const hoverKind = resolveActiveVertexPreview(
      { x: 500, y: 500 },
      node,
      nodesWithOther,
      node.vertices.v1,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
      [otherNode.id],
    );

    // result
    expect(hoverKind).toBe('vertex');
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'vb', x: 500, y: 500 } });
  });

  it('should fall through to the angle-snapped preview when nothing is hovered anywhere', () => {
    // mock — a couple of px off horizontal from v1(0,0), within the angle-snap tolerance
    const penPreviewRef = createPenPreviewRef();

    // before
    const hoverKind = resolveActiveVertexPreview(
      { x: 500, y: 5 },
      node,
      nodes,
      node.vertices.v1,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
      [],
    );

    // result — pulled onto the exact horizontal axis by the angle-snap fallback
    expect(hoverKind).toBeNull();
    expect(penPreviewRef.current?.isSnapped).toBe(true);
    expect(penPreviewRef.current?.to.y).toBeCloseTo(0);
  });

  it('should carry the pending outgoing tangent into every tier when it matches the active vertex', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 5, y: 5 }, vertexId: 'v1' });

    // before
    resolveActiveVertexPreview(
      { x: 500, y: 500 },
      node,
      nodes,
      node.vertices.v1,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      pendingOutgoingTangentRef,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
      [],
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ tangentFromOffset: { x: 5, y: 5 } });
  });
});
