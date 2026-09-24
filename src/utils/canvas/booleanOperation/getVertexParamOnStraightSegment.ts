// others
import { BOOLEAN_JUNCTION_EPSILON } from './constants';

// types
import { TPoint } from 'types/canvas';

export const getVertexParamOnStraightSegment = (start: TPoint, end: TPoint, point: TPoint): number | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared !== 0) {
    const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
    const distance = Math.abs((point.x - start.x) * dy - (point.y - start.y) * dx) / Math.sqrt(lengthSquared);
    const tEpsilon = BOOLEAN_JUNCTION_EPSILON / Math.sqrt(lengthSquared);

    return distance < BOOLEAN_JUNCTION_EPSILON && t > tEpsilon && t < 1 - tEpsilon ? t : null;
  }

  return null;
};
