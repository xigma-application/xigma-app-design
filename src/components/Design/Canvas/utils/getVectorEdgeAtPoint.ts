// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getClosestPointOnLine } from './getClosestPointOnLine';
import { getSegmentMidpoint } from 'utils/canvas/vectorNetwork/getSegmentMidpoint';
import { getVectorCurveSegmentCount } from 'utils/canvas/vectorNetwork/getVectorCurveSegmentCount';

export type TVectorEdgeMatch = { point: TPoint; segmentId: string; snapped: boolean; t: number };

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
    const points = flattenSegment(
      start,
      end,
      segment.tangentStart,
      segment.tangentEnd,
      getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd),
    );
    const candidate = points
      .slice(0, -1)
      .map((current, index) => {
        const { point: candidatePoint, t: localT } = getClosestPointOnLine(point, {
          x1: current.x,
          x2: points[index + 1].x,
          y1: current.y,
          y2: points[index + 1].y,
        });

        return { point: candidatePoint, t: (index + localT) / (points.length - 1) };
      })
      .find(({ point: candidatePoint }) => Math.hypot(point.x - candidatePoint.x, point.y - candidatePoint.y) <= edgeTolerance);

    if (candidate) {
      const midpoint = getSegmentMidpoint(start, end, segment.tangentStart, segment.tangentEnd);
      const snapped = Math.hypot(candidate.point.x - midpoint.x, candidate.point.y - midpoint.y) <= vertexTolerance;

      return { point: snapped ? midpoint : candidate.point, segmentId: segment.id, snapped, t: snapped ? 0.5 : candidate.t };
    }
  }

  return null;
};

export const getAllVectorEdgeMatchesAtPoint = (
  point: TPoint,
  node: TVectorNode,
  edgeTolerance: number,
  vertexTolerance: number,
): TVectorEdgeMatch[] =>
  Object.values(node.segments)
    .map((segment) => findEdgeMatchOnSegment(point, segment, node, edgeTolerance, vertexTolerance))
    .filter((match): match is TVectorEdgeMatch => match !== null);

export const getVectorEdgeAtPoint = (
  point: TPoint,
  node: TVectorNode,
  edgeTolerance: number,
  vertexTolerance: number,
): TVectorEdgeMatch | null => getAllVectorEdgeMatchesAtPoint(point, node, edgeTolerance, vertexTolerance)[0] ?? null;
