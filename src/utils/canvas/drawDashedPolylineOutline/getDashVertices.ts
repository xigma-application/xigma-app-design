// utils
import { getPointAtDistance, TPolylineSegment } from './getPointAtDistance';

export const getDashVertices = (
  segments: TPolylineSegment[],
  perimeter: number,
  zoom: number,
  dashLength: number,
  dashGap: number,
): number[] => {
  const patternLength = (dashLength + dashGap) / zoom;
  const dashCount = Math.max(1, Math.round(perimeter / patternLength));
  const segmentLength = perimeter / dashCount;
  const dashRatio = dashLength / (dashLength + dashGap);

  return Array.from({ length: dashCount }, (_, index) => {
    const start = index * segmentLength;
    const end = start + segmentLength * dashRatio;
    const startPoint = getPointAtDistance(segments, perimeter, start);
    const endPoint = getPointAtDistance(segments, perimeter, end);

    return [startPoint.x, startPoint.y, endPoint.x, endPoint.y];
  }).flat();
};
