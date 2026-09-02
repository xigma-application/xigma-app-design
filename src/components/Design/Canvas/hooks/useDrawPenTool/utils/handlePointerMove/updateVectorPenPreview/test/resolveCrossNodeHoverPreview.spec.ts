// types
import { NodeType } from 'types/design/enums';
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { resolveCrossNodeHoverPreview } from '../resolveCrossNodeHoverPreview';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const activeNode: TVectorNode = {
  defaultFill: null,
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

const otherNode: TVectorNode = { ...activeNode, id: 'vector-2', vertices: { vb: { id: 'vb', x: 500, y: 500 } } };
const nodes: Record<string, TSceneNode> = { [activeNode.id]: activeNode, [otherNode.id]: otherNode };

const createPenPreviewRef = (): TPenRefs['penPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): THoverRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPenHoveredDragArmableVertexRef = (): TPenRefs['penHoveredDragArmableVertexRef'] => ({ current: true });
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({
  current: { horizontal: null, vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } } },
});

describe('resolveCrossNodeHoverPreview', () => {
  it('should draw the preview onto a vertex hovered on another open node, report it not drag-armable, and clear the alignment guide', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();
    const vectorAlignmentGuideRef = createVectorAlignmentGuideRef();

    // before — hover right on vb on the other open node
    const hoverKind = resolveCrossNodeHoverPreview(
      { x: 500, y: 500 },
      [otherNode.id],
      nodes,
      activeNode.vertices.v1,
      null,
      IDENTITY_VIEWPORT,
      penPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      vectorAlignmentGuideRef,
    );

    // result
    expect(hoverKind).toBe('vertex');
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'vb', x: 500, y: 500 } });
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
    expect(vectorAlignmentGuideRef.current).toBeNull();
  });

  it('should skip a stale open-node id that no longer resolves to a vector node', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();

    // before
    const hoverKind = resolveCrossNodeHoverPreview(
      { x: 500, y: 500 },
      ['missing-node'],
      nodes,
      activeNode.vertices.v1,
      null,
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(hoverKind).toBeNull();
    expect(penPreviewRef.current).toBeNull();
  });

  it('should return null when no vertex/edge on any given open node is within tolerance', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();

    // before
    const hoverKind = resolveCrossNodeHoverPreview(
      { x: 5000, y: 5000 },
      [otherNode.id],
      nodes,
      activeNode.vertices.v1,
      null,
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(hoverKind).toBeNull();
    expect(penPreviewRef.current).toBeNull();
  });
});
