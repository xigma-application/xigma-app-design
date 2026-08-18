// utils
import { getEllipseArcMajorArc, TEllipseMajorArc } from './getEllipseArcMajorArc';

export type TEffectiveArcAngles = { effectiveEndAngle: number; effectiveStartAngle: number };

export const getEffectiveArcAngles = (
  arcStartAngle: number,
  arcEndAngle: number,
  arcRatioInverted: boolean,
  precomputedMajorArc?: TEllipseMajorArc,
): TEffectiveArcAngles => {
  if (!arcRatioInverted) {
    return { effectiveEndAngle: arcEndAngle, effectiveStartAngle: arcStartAngle };
  }

  const { majorStart, majorSweep } = precomputedMajorArc ?? getEllipseArcMajorArc(arcStartAngle, arcEndAngle);

  return { effectiveEndAngle: majorStart + majorSweep, effectiveStartAngle: majorStart };
};
