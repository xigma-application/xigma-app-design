// others
import { OFFSET_VECTOR_EDGE_HIT_PX } from 'constant/canvas';

// types
import { TOffsetVectorEdgeHit, TOffsetVectorNode } from './types';
import { TOffsetVectorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { getClosestPointOnSegment } from 'utils/math/getClosestPointOnSegment';
import { getDistanceToOutline } from './getDistanceToOutline';
import { getOffsetVector } from './getOffsetVector';
import { getOffsetVectorSourceOutline } from './getOffsetVectorSourceOutline';

type TEdgeCandidate = { distance: number; end: TPoint; point: TPoint; start: TPoint };

const getNearestEdge = (point: TPoint, polylines: TPoint[][]): TEdgeCandidate =>
  polylines
    .flatMap((points) => points.slice(1).map((end, index) => ({ end, start: points[index] })))
    .reduce<TEdgeCandidate>(
      (nearest, { end, start }) => {
        const closest = getClosestPointOnSegment(point, start, end);
        const distance = Math.hypot(point.x - closest.x, point.y - closest.y);

        return distance < nearest.distance ? { distance, end, point: closest, start } : nearest;
      },
      { distance: Infinity, end: point, point, start: point },
    );

export const getOffsetVectorEdgeAtPoint = (
  point: TPoint,
  node: TOffsetVectorNode,
  offsetVector: TOffsetVectorState,
  viewport: TViewport,
): TOffsetVectorEdgeHit | null => {
  const vector = getOffsetVector(node, offsetVector.distance, offsetVector.join);
  const nearest = getNearestEdge(
    point,
    flattenVectorSegments(vector).map(({ points }) => points),
  );

  if (nearest.distance <= OFFSET_VECTOR_EDGE_HIT_PX / viewport.zoom) {
    const length = Math.hypot(nearest.end.x - nearest.start.x, nearest.end.y - nearest.start.y);
    const perpendicular = { x: -(nearest.end.y - nearest.start.y) / length, y: (nearest.end.x - nearest.start.x) / length };
    const outline = getOffsetVectorSourceOutline(node);
    const step = 1 / viewport.zoom;
    const ahead = getDistanceToOutline(
      { x: nearest.point.x + perpendicular.x * step, y: nearest.point.y + perpendicular.y * step },
      outline,
    );
    const behind = getDistanceToOutline(
      { x: nearest.point.x - perpendicular.x * step, y: nearest.point.y - perpendicular.y * step },
      outline,
    );
    const sign = ahead >= behind ? 1 : -1;
    const normal = { x: perpendicular.x * sign, y: perpendicular.y * sign };

    return { angle: (Math.atan2(normal.y, normal.x) * 180) / Math.PI, normal, point: nearest.point };
  }

  return null;
};
