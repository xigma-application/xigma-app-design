// types
import { TPoint } from 'types/canvas';

type TOffsetEdge = { end: TPoint; length: number; start: TPoint; unit: TPoint };

const EPSILON = 1e-9;
const MITER_LIMIT = 4;

const getOffsetEdges = (points: TPoint[], distance: number, sign: number): TOffsetEdge[] =>
  points.map((start, index) => {
    const end = points[(index + 1) % points.length];
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    const unit = { x: (end.x - start.x) / length, y: (end.y - start.y) / length };
    const normal = { x: sign * unit.y * distance, y: -sign * unit.x * distance };

    return { end: { x: end.x + normal.x, y: end.y + normal.y }, length, start: { x: start.x + normal.x, y: start.y + normal.y }, unit };
  });

const getCross = (previous: TOffsetEdge, next: TOffsetEdge): number => previous.unit.x * next.unit.y - previous.unit.y * next.unit.x;

const getPullback = (previous: TOffsetEdge, next: TOffsetEdge, distance: number, sign: number): number => {
  const cross = getCross(previous, next);
  const dot = previous.unit.x * next.unit.x + previous.unit.y * next.unit.y;

  return Math.abs(cross) >= EPSILON && cross * sign * distance < 0 ? (Math.abs(distance) * Math.abs(cross)) / (1 + dot) : 0;
};

const getCornerPoints = (
  vertex: TPoint,
  previous: TOffsetEdge,
  next: TOffsetEdge,
  distance: number,
  sign: number,
  isMiterSafe: boolean,
): TPoint[] => {
  const cross = getCross(previous, next);
  const t = ((next.start.x - previous.end.x) * next.unit.y - (next.start.y - previous.end.y) * next.unit.x) / cross;
  const miter = { x: previous.end.x + previous.unit.x * t, y: previous.end.y + previous.unit.y * t };

  switch (true) {
    case Math.abs(cross) < EPSILON:
      return previous.unit.x * next.unit.x + previous.unit.y * next.unit.y > 0 ? [next.start] : [previous.end, next.start];
    case cross * sign * distance > 0:
      return Math.hypot(miter.x - vertex.x, miter.y - vertex.y) > MITER_LIMIT * Math.abs(distance) ? [previous.end, next.start] : [miter];
    case isMiterSafe:
      return [miter];
    default:
      return [previous.end, vertex, next.start];
  }
};

export const getRawOffsetLoop = (points: TPoint[], distance: number, sign: number): TPoint[] => {
  const edges = getOffsetEdges(points, distance, sign);
  const count = edges.length;
  const pullbacks = edges.map((edge, index) => getPullback(edges[(index - 1 + count) % count], edge, distance, sign));
  const isEdgeKept = edges.map((edge, index) => pullbacks[index] + pullbacks[(index + 1) % count] < edge.length);

  return points.flatMap((vertex, index) => {
    const previousIndex = (index - 1 + count) % count;

    return getCornerPoints(vertex, edges[previousIndex], edges[index], distance, sign, isEdgeKept[previousIndex] && isEdgeKept[index]);
  });
};
