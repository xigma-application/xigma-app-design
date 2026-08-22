// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { resolveSameNodeHoverPreview } from '../resolveSameNodeHoverPreview';

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

const createPenPreviewRef = (): TCanvasRefs['penPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): TCanvasRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPenHoveredDragArmableVertexRef = (): TCanvasRefs['penHoveredDragArmableVertexRef'] => ({ current: false });
const createVectorAlignmentGuideRef = (): TCanvasRefs['vectorAlignmentGuideRef'] => ({
  current: { horizontal: null, vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } } },
});

describe('resolveSameNodeHoverPreview', () => {
  it('should draw the preview onto the hovered vertex, flag it drag-armable, and clear the alignment guide', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();
    const vectorAlignmentGuideRef = createVectorAlignmentGuideRef();

    // before — active vertex v1, pointer hovers right on v2
    const hoverKind = resolveSameNodeHoverPreview(
      { x: 100, y: 0 },
      node,
      node.vertices.v1,
      'v1',
      null,
      IDENTITY_VIEWPORT,
      penPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      vectorAlignmentGuideRef,
    );

    // result
    expect(hoverKind).toBe('vertex');
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'v2', x: 100, y: 0 } });
    expect(penHoveredDragArmableVertexRef.current).toBe(true);
    expect(vectorAlignmentGuideRef.current).toBeNull();
  });

  it('should return null and leave the refs untouched when nothing on the node is hovered', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();
    const vectorAlignmentGuideRef = createVectorAlignmentGuideRef();

    // before
    const hoverKind = resolveSameNodeHoverPreview(
      { x: 5000, y: 5000 },
      node,
      node.vertices.v1,
      'v1',
      null,
      IDENTITY_VIEWPORT,
      penPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      vectorAlignmentGuideRef,
    );

    // result
    expect(hoverKind).toBeNull();
    expect(penPreviewRef.current).toBeNull();
    expect(vectorAlignmentGuideRef.current).not.toBeNull();
  });
});
