// types
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TPenPointHoverKind } from '../resolvePenPointHover/types';

export const clearVectorPenPreview = (
  penPreviewRef: TPenRefs['penPreviewRef'],
  hoveredSegmentIdRef: THoverRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TPenRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TVectorEditRefs['vectorAlignmentGuideRef'],
): TPenPointHoverKind | null => {
  penPreviewRef.current = null;
  hoveredSegmentIdRef.current = null;
  penHoveredDragArmableVertexRef.current = false;
  vectorAlignmentGuideRef.current = null;

  return null;
};
