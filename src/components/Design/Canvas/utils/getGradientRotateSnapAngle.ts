const SNAP_TOLERANCE_DEG = 3;

export const getGradientRotateSnapAngle = (angle: number): { angle: number; snappedDegrees: number } | null => {
  const degrees = (angle * 180) / Math.PI;
  const nearestAxis = Math.round(degrees / 90) * 90;
  const delta = degrees - nearestAxis;

  if (Math.abs(delta) <= SNAP_TOLERANCE_DEG) {
    return { angle: (nearestAxis * Math.PI) / 180, snappedDegrees: nearestAxis };
  }

  return null;
};
