// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { getEllipseFillPoints } from 'utils/canvas/shapes/getEllipseFillPoints';
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

export const isPointInEllipse = (
  point: TPoint,
  ellipse: TDraftRect & {
    arcEndAngle?: number;
    arcRatio?: number;
    arcRatioInverted?: boolean;
    arcStartAngle?: number;
    cornerRadius?: number;
    flipX?: boolean;
    flipY?: boolean;
  },
): boolean => {
  const radiusX = ellipse.width / 2;
  const radiusY = ellipse.height / 2;
  const centerX = ellipse.x + radiusX;
  const centerY = ellipse.y + radiusY;
  const normalizedX = (point.x - centerX) / radiusX;
  const normalizedY = (point.y - centerY) / radiusY;
  const normalizedRadiusSquared = normalizedX * normalizedX + normalizedY * normalizedY;
  const arcStartAngle = ellipse.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcEndAngle = ellipse.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcRatio = Math.min(Math.max(ellipse.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
  const center: TPoint = { x: centerX, y: centerY };

  switch (true) {
    case normalizedRadiusSquared > 1:
      return false;
    case !hasEllipseArc(arcStartAngle, arcEndAngle):
      return normalizedRadiusSquared >= arcRatio * arcRatio;
    case getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep === 0:
    case arcRatio >= 1:
      return true;
    default:
      return isPointInPolygonVertices(
        flipPoint(point, center, ellipse.flipX ?? false, ellipse.flipY ?? false),
        getEllipseFillPoints(ellipse),
      );
  }
};
