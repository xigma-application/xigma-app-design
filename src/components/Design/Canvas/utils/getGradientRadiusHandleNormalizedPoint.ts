// types
import { TGradientPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';

export const getGradientRadiusHandleNormalizedPoint = (paint: TGradientPaint): TPoint => {
  const axisX = paint.end.x - paint.start.x;
  const axisY = paint.end.y - paint.start.y;
  const primaryRadius = Math.hypot(axisX, axisY);

  if (primaryRadius !== 0) {
    const directionX = axisX / primaryRadius;
    const directionY = axisY / primaryRadius;
    const perpendicularX = -directionY;
    const perpendicularY = directionX;
    const secondaryRadius = primaryRadius * (paint.radiusRatio ?? 1);

    return { x: paint.start.x + perpendicularX * secondaryRadius, y: paint.start.y + perpendicularY * secondaryRadius };
  }

  return { ...paint.start };
};
