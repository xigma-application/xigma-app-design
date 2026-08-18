const normalizeAngle = (angle: number): number => ((angle % 360) + 360) % 360;

export const isAngleWithinArc = (angle: number, start: number, sweep: number): boolean => {
  const offset = normalizeAngle((angle - start) * Math.sign(sweep || 1));
  return offset <= Math.abs(sweep);
};
