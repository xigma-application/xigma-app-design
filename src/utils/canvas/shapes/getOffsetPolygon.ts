// types
import { TPoint } from 'types/canvas';

// utils
import { getVectorFaceSignedArea } from '../vectorNetwork/getVectorFaceSignedArea';

type TOffsetEdge = { corner: TPoint; index: number; normal: TPoint; start: TPoint; unit: TPoint };

const EPSILON = 1e-9;
const MITER_LIMIT = 4;

const getEdges = (points: TPoint[], distance: number, sign: number): TOffsetEdge[] =>
  points.map((corner, index) => {
    const end = points[(index + 1) % points.length];
    const length = Math.hypot(end.x - corner.x, end.y - corner.y);
    const unit = { x: (end.x - corner.x) / length, y: (end.y - corner.y) / length };
    const normal = { x: sign * unit.y * distance, y: -sign * unit.x * distance };

    return { corner, index, normal, start: { x: corner.x + normal.x, y: corner.y + normal.y }, unit };
  });

const intersect = (previous: TOffsetEdge, next: TOffsetEdge): TPoint => {
  const cross = previous.unit.x * next.unit.y - previous.unit.y * next.unit.x;

  if (Math.abs(cross) < EPSILON) {
    return next.start;
  }

  const t = ((next.start.x - previous.start.x) * next.unit.y - (next.start.y - previous.start.y) * next.unit.x) / cross;
  return { x: previous.start.x + previous.unit.x * t, y: previous.start.y + previous.unit.y * t };
};

const getInvertedEdge = (edges: TOffsetEdge[], vertices: TPoint[]): number =>
  edges.findIndex((edge, index) => {
    const from = vertices[index];
    const to = vertices[(index + 1) % vertices.length];
    return (to.x - from.x) * edge.unit.x + (to.y - from.y) * edge.unit.y < -EPSILON;
  });

const getCornerPoints = (previous: TOffsetEdge, next: TOffsetEdge, vertex: TPoint, distance: number, count: number): TPoint[] => {
  const isOriginalCorner = (previous.index + 1) % count === next.index;
  const miter = Math.hypot(vertex.x - next.corner.x, vertex.y - next.corner.y);

  return isOriginalCorner && miter > MITER_LIMIT * Math.abs(distance)
    ? [{ x: next.corner.x + previous.normal.x, y: next.corner.y + previous.normal.y }, next.start]
    : [vertex];
};

export const getOffsetPolygon = (points: TPoint[], distance: number): TPoint[] | null => {
  const cleaned = points.filter((point, index) => {
    const next = points[(index + 1) % points.length];
    return Math.hypot(next.x - point.x, next.y - point.y) > EPSILON;
  });
  const sign = Math.sign(getVectorFaceSignedArea(cleaned));
  let edges = cleaned.length >= 3 ? getEdges(cleaned, distance, sign) : [];

  while (edges.length >= 3) {
    const current = edges;
    const vertices = current.map((edge, index) => intersect(current[(index - 1 + current.length) % current.length], edge));
    const inverted = getInvertedEdge(current, vertices);

    if (inverted < 0) {
      return current.flatMap((edge, index) =>
        getCornerPoints(current[(index - 1 + current.length) % current.length], edge, vertices[index], distance, cleaned.length),
      );
    }

    edges = current.filter((_, index) => index !== inverted);
  }

  return null;
};
