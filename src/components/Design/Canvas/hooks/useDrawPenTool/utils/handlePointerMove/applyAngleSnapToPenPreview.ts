// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenPointHoverKind } from './resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { getAngleSnappedVectorPoint } from 'utils/canvas/vectorNetwork/getAngleSnappedVectorPoint';

export const applyAngleSnapToPenPreview = (
  point: TPoint,
  activeVertex: TVectorVertex,
  tangentFromOffset: TVectorTangent,
  zoom: number,
  isShiftPressed: boolean,
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
): TPenPointHoverKind | null => {
  const { isSnapped, point: snappedPoint } = getAngleSnappedVectorPoint(activeVertex, point, zoom, isShiftPressed);

  penPreviewRef.current = { from: activeVertex, isSnapped, tangentFromOffset, to: snappedPoint };
  hoveredSegmentIdRef.current = null;
  penHoveredDragArmableVertexRef.current = false;

  return null;
};
