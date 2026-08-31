// types
import { TPoint } from 'types/canvas';

// utils
import { getCentroid } from 'utils/canvas/vectorNetwork/eraseVectorNetwork/subtractCapsuleFromVectorNetwork/getCentroid';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const getPointInsideFace = (points: TPoint[]): TPoint => {
  for (let index = 0; index < points.length; index += 1) {
    const from = points[index];
    const to = points[(index + 1) % points.length];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);

    if (length > 0) {
      const epsilon = length * 0.01;
      const midpoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
      const normal = { x: -dy / length, y: dx / length };
      const candidates = [
        { x: midpoint.x + normal.x * epsilon, y: midpoint.y + normal.y * epsilon },
        { x: midpoint.x - normal.x * epsilon, y: midpoint.y - normal.y * epsilon },
      ];
      const insideCandidate = candidates.find((candidate) => isPointInPolygonVertices(candidate, points));

      if (insideCandidate) {
        return insideCandidate;
      }
    }
  }

  return getCentroid(points);
};
