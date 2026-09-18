// types
import { TContrastCurvePoint } from '../types';

export const projectPointOnSegment = (
  point: TContrastCurvePoint,
  start: TContrastCurvePoint,
  end: TContrastCurvePoint,
): TContrastCurvePoint => {
  const dx = end.s - start.s;
  const dy = end.v - start.v;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared !== 0) {
    const t = Math.min(1, Math.max(0, ((point.s - start.s) * dx + (point.v - start.v) * dy) / lengthSquared));
    return { s: start.s + t * dx, v: start.v + t * dy };
  }

  return start;
};
