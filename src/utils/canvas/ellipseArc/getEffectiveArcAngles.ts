// utils
import { getEllipseArcMajorArc } from './getEllipseArcMajorArc';

export type TEffectiveArcAngles = { effectiveEndAngle: number; effectiveStartAngle: number };

export const getEffectiveArcAngles = (arcStartAngle: number, arcEndAngle: number, arcRatioInverted: boolean): TEffectiveArcAngles => {
  if (!arcRatioInverted) {
    return { effectiveEndAngle: arcEndAngle, effectiveStartAngle: arcStartAngle };
  }

  const { majorStart, majorSweep } = getEllipseArcMajorArc(arcStartAngle, arcEndAngle);

  return { effectiveEndAngle: majorStart + majorSweep, effectiveStartAngle: majorStart };
};
