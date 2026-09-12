// types
import { TPoint } from 'types/canvas';

// utils
import { getSquircleCornerPathParams } from './getSquircleCornerPathParams';
import { sampleCornerArc } from './sampleCornerArc';
import { sampleCubicBezier } from './sampleCubicBezier';

export type TSquircleCorner = {
  entryDir: TPoint;
  exitDir: TPoint;
  vertex: TPoint;
};

const along = (from: TPoint, entryDir: TPoint, exitDir: TPoint, alongEntry: number, alongExit: number): TPoint => ({
  x: from.x + entryDir.x * alongEntry + exitDir.x * alongExit,
  y: from.y + entryDir.y * alongEntry + exitDir.y * alongExit,
});

export const getSquircleCornerPoints = (
  corner: TSquircleCorner,
  cornerRadius: number,
  cornerSmoothing: number,
  roundingAndSmoothingBudget: number,
  segmentsPerCorner: number,
): TPoint[] => {
  const { entryDir, exitDir, vertex } = corner;
  const { a, arcSectionLength, b, c, d, p } = getSquircleCornerPathParams(cornerRadius, cornerSmoothing, roundingAndSmoothingBudget);
  const entryPoint = along(vertex, entryDir, exitDir, -p, 0);
  const control1 = along(entryPoint, entryDir, exitDir, a, 0);
  const control2 = along(entryPoint, entryDir, exitDir, a + b, 0);
  const arcStart = along(entryPoint, entryDir, exitDir, a + b + c, d);
  const arcEnd = along(arcStart, entryDir, exitDir, arcSectionLength, arcSectionLength);
  const control3 = along(arcEnd, entryDir, exitDir, d, c);
  const control4 = along(arcEnd, entryDir, exitDir, d, b + c);
  const exitPoint = along(arcEnd, entryDir, exitDir, d, a + b + c);
  const center = along(vertex, entryDir, exitDir, -cornerRadius, cornerRadius);
  const firstBezier = sampleCubicBezier(entryPoint, control1, control2, arcStart, segmentsPerCorner);
  const arc = sampleCornerArc(center, cornerRadius, arcStart, arcEnd, segmentsPerCorner);
  const secondBezier = sampleCubicBezier(arcEnd, control3, control4, exitPoint, segmentsPerCorner);

  return [...firstBezier, ...arc.slice(1), ...secondBezier.slice(1)];
};
