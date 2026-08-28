// others
import { PEN_POINT_HOVER_RESOLVERS } from './resolvePenPointHover/constants';

// types
import { THoverRefs, TPenRefs } from 'types/design/canvas/types';
import { TPenPointHoverKind } from './resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

export const updateNewVertexPreview = (
  point: TPoint,
  node: TVectorNode | null,
  viewport: TViewport,
  penNewVertexPreviewRef: TPenRefs['penNewVertexPreviewRef'],
  hoveredSegmentIdRef: THoverRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TPenRefs['penHoveredDragArmableVertexRef'],
): TPenPointHoverKind | null => {
  if (node) {
    for (const resolve of PEN_POINT_HOVER_RESOLVERS) {
      const result = resolve({ node, point, viewport });

      if (result) {
        penNewVertexPreviewRef.current = result.point;
        hoveredSegmentIdRef.current = result.segmentId;
        penHoveredDragArmableVertexRef.current = result.hoverKind === 'vertex';

        return result.hoverKind;
      }
    }
  }

  penNewVertexPreviewRef.current = point;
  hoveredSegmentIdRef.current = null;
  penHoveredDragArmableVertexRef.current = false;

  return null;
};
