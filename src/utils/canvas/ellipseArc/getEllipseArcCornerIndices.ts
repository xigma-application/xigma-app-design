export const getEllipseArcCornerIndices = (pointCount: number, isRing: boolean): number[] =>
  isRing ? [0, pointCount / 2 - 1, pointCount / 2, pointCount - 1] : [0, 1, pointCount - 1];
