// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE, ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getEffectiveArcAngles } from 'utils/canvas/ellipseArc/getEffectiveArcAngles';
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { getEllipseArcPoints } from 'utils/canvas/shapes/getEllipseArcPoints';
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

export const isPointInEllipse = (
  point: TPoint,
  ellipse: TDraftRect & {
    arcEndAngle?: number;
    arcRatio?: number;
    arcRatioInverted?: boolean;
    arcStartAngle?: number;
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

  if (normalizedRadiusSquared > 1) {
    return false;
  }

  const arcStartAngle = ellipse.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcEndAngle = ellipse.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcRatio = Math.min(Math.max(ellipse.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);

  if (!hasEllipseArc(arcStartAngle, arcEndAngle)) {
    return normalizedRadiusSquared >= arcRatio * arcRatio;
  }

  if (getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep === 0) {
    return true;
  }

  if (arcRatio >= 1) {
    return true;
  }

  const center: TPoint = { x: centerX, y: centerY };
  const testPoint = flipPoint(point, center, ellipse.flipX ?? false, ellipse.flipY ?? false);
  const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(arcStartAngle, arcEndAngle, ellipse.arcRatioInverted ?? false);
  const outerPoints = getEllipseArcPoints(ellipse, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS);
  const vertices =
    arcRatio > 0
      ? [...outerPoints, ...[...getEllipseArcPoints(ellipse, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS, arcRatio)].reverse()]
      : [center, ...outerPoints];

  return isPointInPolygonVertices(testPoint, vertices);
};
