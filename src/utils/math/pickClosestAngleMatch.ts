const getAngularDistance = (a: number, b: number): number => {
  const diff = Math.abs(a - b) % 360;

  return diff > 180 ? 360 - diff : diff;
};

export const pickClosestAngleMatch = <T extends { angle: number }>(candidates: T[], targetAngle: number): T =>
  candidates.reduce((best, candidate) =>
    getAngularDistance(candidate.angle, targetAngle) < getAngularDistance(best.angle, targetAngle) ? candidate : best,
  );
