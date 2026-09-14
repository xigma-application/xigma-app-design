// types
import { TPoint } from 'types/canvas';

export const getPositionAroundGradientEllipse = (point: TPoint, start: TPoint, end: TPoint, radiusRatio: number): number => {
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
    const a = relativeX * directionX + relativeY * directionY;
    const b = (relativeX * perpendicularX + relativeY * perpendicularY) / radiusRatio;
    let angle = Math.atan2(b, a);

    if (angle < 0) {
      angle += 2 * Math.PI;
    }

    return angle / (2 * Math.PI);
  }

  return 0;
};
