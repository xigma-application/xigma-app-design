// utils
import { getEllipseArcMajorArc } from './getEllipseArcMajorArc';

export const hasEllipseArc = (arcStartAngle: number, arcEndAngle: number): boolean =>
  Math.abs(getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep) < 360;
