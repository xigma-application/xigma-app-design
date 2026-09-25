export const getEllipseArcSweepSpan = (sweepPercent: number): number =>
  Math.abs(sweepPercent) >= 100 ? 0 : (Math.sign(sweepPercent) || 1) * ((100 - Math.abs(sweepPercent)) / 100) * 360;
