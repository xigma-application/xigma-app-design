// types
import { TBrushStrip } from '../types';
import { TContourEdge } from './types';

// others
import { THRESHOLD } from './constants';

// utils
import { getPaddedValue } from './getPaddedValue';

export const getEdgePoint = (strip: TBrushStrip, from: [number, number], to: [number, number], key: string): TContourEdge => {
  const fromValue = getPaddedValue(strip, from[0], from[1]);
  const toValue = getPaddedValue(strip, to[0], to[1]);
  const t = fromValue === toValue ? 0.5 : (THRESHOLD - fromValue) / (toValue - fromValue);

  return { key, x: from[0] + (to[0] - from[0]) * t - 1, y: from[1] + (to[1] - from[1]) * t - 1 };
};
