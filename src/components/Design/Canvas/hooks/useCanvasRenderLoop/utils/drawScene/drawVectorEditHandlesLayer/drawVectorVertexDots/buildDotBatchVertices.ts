// types
import { TPoint } from 'types/canvas';

export const FLOATS_PER_POINT = 2;
export const POINTS_PER_TRIANGLE = 3;

export const buildDotBatchVertices = (centers: TPoint[], unitRimPoints: TPoint[]): Float32Array => {
  const trianglesPerDot = unitRimPoints.length;
  const floatsPerDot = trianglesPerDot * POINTS_PER_TRIANGLE * FLOATS_PER_POINT;
  const vertices = new Float32Array(centers.length * floatsPerDot);

  centers.forEach((center, dotIndex) => {
    const dotOffset = dotIndex * floatsPerDot;

    unitRimPoints.forEach((point, pointIndex) => {
      const nextPoint = unitRimPoints[(pointIndex + 1) % unitRimPoints.length];
      const triangleOffset = dotOffset + pointIndex * POINTS_PER_TRIANGLE * FLOATS_PER_POINT;

      vertices[triangleOffset] = center.x;
      vertices[triangleOffset + 1] = center.y;
      vertices[triangleOffset + 2] = center.x + point.x;
      vertices[triangleOffset + 3] = center.y + point.y;
      vertices[triangleOffset + 4] = center.x + nextPoint.x;
      vertices[triangleOffset + 5] = center.y + nextPoint.y;
    });
  });

  return vertices;
};
