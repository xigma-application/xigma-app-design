// types
import { TPoint } from 'types/canvas';

// utils
import { getQuadVertices } from './getQuadVertices';

export const getRingVertices = (outerPoints: TPoint[], innerPoints: TPoint[]): number[] => {
  const pointCount = outerPoints.length;

  return outerPoints.flatMap((outerPoint, index) => {
    const nextIndex = (index + 1) % pointCount;

    return getQuadVertices(
      outerPoint.x,
      outerPoint.y,
      outerPoints[nextIndex].x,
      outerPoints[nextIndex].y,
      innerPoints[nextIndex].x,
      innerPoints[nextIndex].y,
      innerPoints[index].x,
      innerPoints[index].y,
    );
  });
};
