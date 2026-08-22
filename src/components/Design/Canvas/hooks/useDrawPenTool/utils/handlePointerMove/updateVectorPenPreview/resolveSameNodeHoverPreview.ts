// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenPointHoverKind } from '../resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorTangent, TVectorVertex, TViewport } from 'types/design/types';

// utils
import { findHoverInNode } from './findHoverInNode';

export const resolveSameNodeHoverPreview = (
  point: TPoint,
  node: TVectorNode,
  activeVertex: TVectorVertex,
  activeVertexId: string,
  tangentFromOffset: TVectorTangent,
  viewport: TViewport,
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
): TPenPointHoverKind | null => {
  const result = findHoverInNode(node, point, viewport, activeVertexId);

  if (result) {
    penPreviewRef.current = { from: activeVertex, isSnapped: false, tangentFromOffset, to: result.point };
    hoveredSegmentIdRef.current = result.segmentId;
    penHoveredDragArmableVertexRef.current = result.hoverKind === 'active-vertex' || result.hoverKind === 'vertex';
    vectorAlignmentGuideRef.current = null;

    return result.hoverKind;
  }

  return null;
};
