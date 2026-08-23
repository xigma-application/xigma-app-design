// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getClosestPointOnLine } from './getClosestPointOnLine';
import { getVectorCurveSegmentCount } from 'utils/canvas/vectorNetwork/getVectorCurveSegmentCount';

export type TVectorCutHit = { point: TPoint; segmentId: string; t: number };

const findCutHitOnSegment = (
  point: TPoint,
  segment: TVectorSegment,
  node: TVectorNode,
  edgeTolerance: number,
  vertexTolerance: number,
): TVectorCutHit | null => {
  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];
  const distanceToStart = Math.hypot(point.x - start.x, point.y - start.y);
  const distanceToEnd = Math.hypot(point.x - end.x, point.y - end.y);

  if (distanceToStart <= vertexTolerance && distanceToStart <= distanceToEnd) {
    return { point: { x: start.x, y: start.y }, segmentId: segment.id, t: 0 };
  }

  if (distanceToEnd <= vertexTolerance) {
    return { point: { x: end.x, y: end.y }, segmentId: segment.id, t: 1 };
  }

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

  return candidate ? { point: candidate.point, segmentId: segment.id, t: candidate.t } : null;
};

export const getVectorCutHitAtPoint = (
  point: TPoint,
  node: TVectorNode,
  edgeTolerance: number,
  vertexTolerance: number,
): TVectorCutHit | null => {
  const hits = Object.values(node.segments)
    .map((segment) => findCutHitOnSegment(point, segment, node, edgeTolerance, vertexTolerance))
    .filter((hit): hit is TVectorCutHit => hit !== null)
    .sort((a, b) => Math.hypot(point.x - a.point.x, point.y - a.point.y) - Math.hypot(point.x - b.point.x, point.y - b.point.y));

  return hits[0] ?? null;
};
