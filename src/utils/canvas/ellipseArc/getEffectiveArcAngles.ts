// utils
import { getEllipseArcMajorArc } from './getEllipseArcMajorArc';

export type TEffectiveArcAngles = { effectiveEndAngle: number; effectiveStartAngle: number };

// arcStartAngle/arcEndAngle always describe the CUT sweep, never the filled side directly — the arc
// utilities resolve that pair into the filled majority themselves. When arcRatioInverted, the ring
// belongs on the complementary side instead (matches Figma: drag the Ratio handle into the gap to
// swap which segment is shown), so this feeds a different raw pair back through that same
// resolution — (majorStart, majorStart + majorSweep) is the one pair whose OWN majorArc resolves to
// the complement of the original, rather than a new majorStart/majorSweep computed by hand.
export const getEffectiveArcAngles = (arcStartAngle: number, arcEndAngle: number, arcRatioInverted: boolean): TEffectiveArcAngles => {
  if (!arcRatioInverted) {
    return { effectiveEndAngle: arcEndAngle, effectiveStartAngle: arcStartAngle };
  }

  const { majorStart, majorSweep } = getEllipseArcMajorArc(arcStartAngle, arcEndAngle);

  return { effectiveEndAngle: majorStart + majorSweep, effectiveStartAngle: majorStart };
};
