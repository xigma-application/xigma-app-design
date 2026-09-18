// types
import { TContrastCurvePoint } from '../../../ContrastChecker/types';

export const getVisibleCurve = (points: TContrastCurvePoint[]): TContrastCurvePoint[] => {
  const firstClamped = points.findIndex((point) => point.v >= 100);
  return firstClamped === -1 ? points : points.slice(0, firstClamped + 1);
};
