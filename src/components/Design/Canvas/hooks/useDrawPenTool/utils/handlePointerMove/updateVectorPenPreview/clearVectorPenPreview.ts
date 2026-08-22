// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenPointHoverKind } from '../resolvePenPointHover/types';

export const clearVectorPenPreview = (
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
): TPenPointHoverKind | null => {
  penPreviewRef.current = null;
  hoveredSegmentIdRef.current = null;
  penHoveredDragArmableVertexRef.current = false;
  vectorAlignmentGuideRef.current = null;

  return null;
};
