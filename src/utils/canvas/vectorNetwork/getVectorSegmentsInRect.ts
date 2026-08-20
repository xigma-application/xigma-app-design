// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenSegment } from './flattenSegment';
import { getVectorCurveSegmentCount } from './getVectorCurveSegmentCount';

const doesOverlapRect = (bounds: TDraftRect, rect: TDraftRect): boolean =>
  !(
    bounds.x + bounds.width < rect.x ||
    bounds.x > rect.x + rect.width ||
    bounds.y + bounds.height < rect.y ||
    bounds.y > rect.y + rect.height
  );

export const getVectorSegmentsInRect = (node: TVectorNode, rect: TDraftRect): string[] =>
  Object.values(node.segments)
    .filter((segment) => {
      const start = node.vertices[segment.startId];
      const end = node.vertices[segment.endId];
      const points = flattenSegment(
        start,
        end,
        segment.tangentStart,
        segment.tangentEnd,
        getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd),
      );
      const xs = points.map((point) => point.x);
      const ys = points.map((point) => point.y);
      const bounds = {
        height: Math.max(...ys) - Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        x: Math.min(...xs),
        y: Math.min(...ys),
      };

      return doesOverlapRect(bounds, rect);
    })
    .map((segment) => segment.id);
