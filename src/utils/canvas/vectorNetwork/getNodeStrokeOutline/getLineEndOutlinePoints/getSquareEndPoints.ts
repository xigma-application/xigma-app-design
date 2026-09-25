// types
import { TPoint } from 'types/canvas';

export const getSquareEndPoints = (halfWidth: number): TPoint[] => [
  { x: 0, y: halfWidth },
  { x: halfWidth, y: halfWidth },
  { x: halfWidth, y: -halfWidth },
  { x: 0, y: -halfWidth },
];
