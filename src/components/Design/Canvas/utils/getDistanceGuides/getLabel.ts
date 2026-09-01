// types
import { TDistanceGuideLabel } from './types';
import { TPoint } from 'types/canvas';

export const getLabel = (x1: number, y1: number, x2: number, y2: number, offsetDirection: TPoint, value: number): TDistanceGuideLabel => ({
  anchor: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
  offsetDirection,
  text: `${Math.round(value)}`,
});
