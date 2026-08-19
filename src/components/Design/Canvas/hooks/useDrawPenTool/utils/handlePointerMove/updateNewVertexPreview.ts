// others
import { PEN_POINT_HOVER_RESOLVERS } from './resolvePenPointHover/constants';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenPointHoverKind } from './resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

export const updateNewVertexPreview = (
  point: TPoint,
  node: TVectorNode | null,
  viewport: TViewport,
  penNewVertexPreviewRef: TCanvasRefs['penNewVertexPreviewRef'],
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
): TPenPointHoverKind | null => {
  if (node) {
    for (const resolve of PEN_POINT_HOVER_RESOLVERS) {
      const result = resolve({ node, point, viewport });

      if (result) {
        penNewVertexPreviewRef.current = result.point;
        hoveredSegmentIdRef.current = result.segmentId;

        return result.hoverKind;
      }
    }
  }

  penNewVertexPreviewRef.current = point;
  hoveredSegmentIdRef.current = null;

  return null;
};
