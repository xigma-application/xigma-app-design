// utils
import { getEllipseArcMajorArc } from './getEllipseArcMajorArc';
import { hasEllipseArc } from './hasEllipseArc';

export const hasEllipseArcRotateHandle = (arcStartAngle: number, arcEndAngle: number): boolean =>
  hasEllipseArc(arcStartAngle, arcEndAngle) && getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep !== 0;
