// others
import { BOOLEAN_STRAIGHT_SAMPLE_OFFSET } from './constants';

// types
import { TPoint } from 'types/canvas';

// utils
import { getPointInsideFace } from '../vectorNetwork/buildVectorNodeFromLoops/assembleVectorNodeFromLoopGeometries/getPointInsideFace';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

const getEdgeLength = (points: TPoint[], index: number): number => {
  const next = points[(index + 1) % points.length];

  return Math.hypot(next.x - points[index].x, next.y - points[index].y);
};

export const getBooleanFacePoint = (points: TPoint[]): TPoint => {
  const index = points.reduce(
    (longest, _, current) => (getEdgeLength(points, current) > getEdgeLength(points, longest) ? current : longest),
    0,
  );
  const from = points[index];
  const to = points[(index + 1) % points.length];
  const length = getEdgeLength(points, index);
  const offset = Math.min(length * 0.01, BOOLEAN_STRAIGHT_SAMPLE_OFFSET);
  const midpoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const normal = length > 0 ? { x: -(to.y - from.y) / length, y: (to.x - from.x) / length } : { x: 0, y: 0 };
  const candidates = [
    { x: midpoint.x + normal.x * offset, y: midpoint.y + normal.y * offset },
    { x: midpoint.x - normal.x * offset, y: midpoint.y - normal.y * offset },
  ];

  return candidates.find((candidate) => isPointInPolygonVertices(candidate, points)) ?? getPointInsideFace(points);
};
