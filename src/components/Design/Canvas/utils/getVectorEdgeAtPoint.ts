// others
import { VECTOR_CURVE_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { isPointNearLine } from './isPointNearLine';

export const getVectorEdgeAtPoint = (
  point: TPoint,
  node: TVectorNode,
  edgeTolerance: number,
  vertexTolerance: number,
): { segmentId: string } | null => {
  const match = Object.values(node.segments).find((segment) => {
    const start = node.vertices[segment.startId];
    const end = node.vertices[segment.endId];
    const nearEndpoint =
      Math.hypot(point.x - start.x, point.y - start.y) <= vertexTolerance ||
      Math.hypot(point.x - end.x, point.y - end.y) <= vertexTolerance;

    if (!nearEndpoint) {
      const points = flattenSegment(start, end, segment.tangentStart, segment.tangentEnd, VECTOR_CURVE_SEGMENTS);

      return points
        .slice(0, -1)
        .some((current, index) =>
          isPointNearLine(point, { x1: current.x, x2: points[index + 1].x, y1: current.y, y2: points[index + 1].y }, edgeTolerance),
        );
    }

    return false;
  });

  return match ? { segmentId: match.id } : null;
};
