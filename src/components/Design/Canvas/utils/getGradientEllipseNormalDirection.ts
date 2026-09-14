// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientEllipsePoint } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientEllipsePoint';
import { getGradientRadialOutwardDirection } from './getGradientRadialOutwardDirection';
import { getGradientWorldPoints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientWorldPoints';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const getGradientEllipseNormalDirection = (
  bounds: TDraftRect,
  rotation: number,
  paint: TGradientPaint,
  position: number,
): TPoint => {
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
    const tangentX = -directionX * Math.sin(angle) + perpendicularX * Math.cos(angle) * radiusRatio;
    const tangentY = -directionY * Math.sin(angle) + perpendicularY * Math.cos(angle) * radiusRatio;
    const localTangent: TPoint = { x: tangentX * bounds.width, y: tangentY * bounds.height };
    const worldTangent = rotatePoint(localTangent, ORIGIN, rotation);
    const tangentLength = Math.hypot(worldTangent.x, worldTangent.y);

    if (tangentLength !== 0) {
      const normalCandidate: TPoint = { x: -worldTangent.y / tangentLength, y: worldTangent.x / tangentLength };
      const ellipsePoint = getGradientEllipsePoint(bounds, rotation, paint, position);
      const ellipseCenter = getGradientWorldPoints(bounds, rotation, paint).start;
      const outwardHint = getGradientRadialOutwardDirection(ellipsePoint, ellipseCenter);
      const sign = normalCandidate.x * outwardHint.x + normalCandidate.y * outwardHint.y >= 0 ? 1 : -1;

      return { x: normalCandidate.x * sign, y: normalCandidate.y * sign };
    }
  }

  return { x: 0, y: -1 };
};
