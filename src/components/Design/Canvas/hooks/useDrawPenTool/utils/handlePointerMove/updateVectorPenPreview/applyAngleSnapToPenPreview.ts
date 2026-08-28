// types
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TPenPointHoverKind } from '../resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { applyVectorPointSnapping } from '../../../../../utils/applyVectorPointSnapping';

export const applyAngleSnapToPenPreview = (
  point: TPoint,
  activeVertex: TVectorVertex,
  tangentFromOffset: TVectorTangent,
  zoom: number,
  isShiftPressed: boolean,
  nodes: Record<string, TSceneNode>,
  penPreviewRef: TPenRefs['penPreviewRef'],
  hoveredSegmentIdRef: THoverRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TPenRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TVectorEditRefs['vectorAlignmentGuideRef'],
): TPenPointHoverKind | null => {
  const { guide, isAngleSnapped, point: snappedPoint } = applyVectorPointSnapping(activeVertex, point, zoom, isShiftPressed, nodes);

  penPreviewRef.current = { from: activeVertex, isSnapped: isAngleSnapped, tangentFromOffset, to: snappedPoint };
  hoveredSegmentIdRef.current = null;
  penHoveredDragArmableVertexRef.current = false;
  vectorAlignmentGuideRef.current = guide;

  return null;
};
