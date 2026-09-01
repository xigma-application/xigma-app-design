// types
import { TNodeFace } from './types';

// utils
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { isFullyContained } from './isFullyContained';

export const getContainingFace = (face: TNodeFace, others: TNodeFace[]): TNodeFace | null => {
  const faceArea = getPolygonArea(face.points);

  const containing = others
    .filter((other) => other.key !== face.key)
    .filter((other) => other.sign !== face.sign)
    .filter((other) => getPolygonArea(other.points) > faceArea)
    .filter((other) => isFullyContained(face, other));

  if (containing.length === 0) {
    return null;
  }

  return containing.reduce((smallest, other) => (getPolygonArea(other.points) < getPolygonArea(smallest.points) ? other : smallest));
};
