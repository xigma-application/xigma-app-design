// types
import { TPoint } from 'types/canvas';
import { TBounds } from './types';

export const getBounds = (points: TPoint[]): TBounds => [
  Math.min(...points.map((p) => p.x)),
  Math.min(...points.map((p) => p.y)),
  Math.max(...points.map((p) => p.x)),
  Math.max(...points.map((p) => p.y)),
];
