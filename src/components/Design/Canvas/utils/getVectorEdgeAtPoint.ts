// others
import { VECTOR_CURVE_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getClosestPointOnLine } from './getClosestPointOnLine';
import { getSegmentMidpoint } from 'utils/canvas/vectorNetwork/getSegmentMidpoint';

type TVectorEdgeMatch = { point: TPoint; segmentId: string; snapped: boolean };

const findEdgeMatchOnSegment = (
  point: TPoint,
  segment: TVectorSegment,
  node: TVectorNode,
  edgeTolerance: number,
  vertexTolerance: number,
): TVectorEdgeMatch | null => {
  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];
  const nearEndpoint =
    Math.hypot(point.x - start.x, point.y - start.y) <= vertexTolerance || Math.hypot(point.x - end.x, point.y - end.y) <= vertexTolerance;

  if (!nearEndpoint) {
    const points = flattenSegment(start, end, segment.tangentStart, segment.tangentEnd, VECTOR_CURVE_SEGMENTS);
    const closestPoint = points
      .slice(0, -1)
      .map((current, index) =>
        getClosestPointOnLine(point, { x1: current.x, x2: points[index + 1].x, y1: current.y, y2: points[index + 1].y }),
      )
      .find((candidate) => Math.hypot(point.x - candidate.x, point.y - candidate.y) <= edgeTolerance);

    if (closestPoint) {
      const midpoint = getSegmentMidpoint(start, end, segment.tangentStart, segment.tangentEnd);
      const snapped = Math.hypot(closestPoint.x - midpoint.x, closestPoint.y - midpoint.y) <= vertexTolerance;

      return { point: snapped ? midpoint : closestPoint, segmentId: segment.id, snapped };
    }
  }

  return null;
};

export const getVectorEdgeAtPoint = (
  point: TPoint,
  node: TVectorNode,
  edgeTolerance: number,
  vertexTolerance: number,
): TVectorEdgeMatch | null => {
  const matches = Object.values(node.segments)
    .map((segment) => findEdgeMatchOnSegment(point, segment, node, edgeTolerance, vertexTolerance))
    .filter((match): match is TVectorEdgeMatch => match !== null);

  return matches[0] ?? null;
};
