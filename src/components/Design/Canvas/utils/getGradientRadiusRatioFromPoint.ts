// types
import { TPoint } from 'types/canvas';

const MIN_RADIUS_RATIO = 0.01;

export const getGradientRadiusRatioFromPoint = (start: TPoint, end: TPoint, point: TPoint): number => {
  const axisX = end.x - start.x;
  const axisY = end.y - start.y;
  const primaryRadius = Math.hypot(axisX, axisY);

  if (primaryRadius !== 0) {
    const directionX = axisX / primaryRadius;
    const directionY = axisY / primaryRadius;
    const perpendicularX = -directionY;
    const perpendicularY = directionX;
    const relativeX = point.x - start.x;
    const relativeY = point.y - start.y;
    const projection = relativeX * perpendicularX + relativeY * perpendicularY;

    return Math.max(Math.abs(projection) / primaryRadius, MIN_RADIUS_RATIO);
  }

  return 1;
};
