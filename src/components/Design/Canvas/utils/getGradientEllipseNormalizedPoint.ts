// types
import { TGradientPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';

export const getGradientEllipseNormalizedPoint = (paint: TGradientPaint, position: number): TPoint => {
  const axisX = paint.end.x - paint.start.x;
  const axisY = paint.end.y - paint.start.y;
  const primaryRadius = Math.hypot(axisX, axisY);

  if (primaryRadius !== 0) {
    const directionX = axisX / primaryRadius;
    const directionY = axisY / primaryRadius;
    const perpendicularX = -directionY;
    const perpendicularY = directionX;
    const radiusRatio = paint.radiusRatio ?? 1;
    const angle = position * 2 * Math.PI;
    const a = Math.cos(angle) * primaryRadius;
    const b = Math.sin(angle) * primaryRadius * radiusRatio;

    return {
      x: paint.start.x + directionX * a + perpendicularX * b,
      y: paint.start.y + directionY * a + perpendicularY * b,
    };
  }

  return { ...paint.start };
};
