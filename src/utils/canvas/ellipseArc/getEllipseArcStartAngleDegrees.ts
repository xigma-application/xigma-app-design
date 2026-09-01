// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

export const getEllipseArcStartAngleDegrees = (arcStartAngle: number): number => {
  const delta = arcStartAngle - ELLIPSE_DEFAULT_ARC_ANGLE;
  const wrapped = ((delta % 360) + 360) % 360;

  return wrapped >= 180 ? wrapped - 360 : wrapped;
};
