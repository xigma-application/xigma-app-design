// types
import { TBrushStrip } from '../types';

export const getPaddedValue = (strip: TBrushStrip, x: number, y: number): number => {
  const column = x - 1;
  const row = y - 1;

  return column < 0 || row < 0 || column >= strip.length || row >= strip.height ? 0 : strip.data[row * strip.length + column];
};
