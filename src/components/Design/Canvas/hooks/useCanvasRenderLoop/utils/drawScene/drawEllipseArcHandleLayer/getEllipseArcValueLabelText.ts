// utils
import { getEllipseArcSweepPercent } from 'utils/canvas/ellipseArc/getEllipseArcSweepPercent';

export const getEllipseArcValueLabelText = (arcStartAngle: number, arcEndAngle: number): string => {
  const percent = getEllipseArcSweepPercent(arcStartAngle, arcEndAngle);

  return percent === null ? 'Arc' : `Sweep ${percent.toFixed(1)}%`;
};
