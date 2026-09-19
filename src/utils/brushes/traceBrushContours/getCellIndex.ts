// types
import { TBrushStrip } from '../types';

// others
import { THRESHOLD } from './constants';

// utils
import { getPaddedValue } from './getPaddedValue';

export const getCellIndex = (strip: TBrushStrip, x: number, y: number): number =>
  (getPaddedValue(strip, x, y) >= THRESHOLD ? 1 : 0) |
  (getPaddedValue(strip, x + 1, y) >= THRESHOLD ? 2 : 0) |
  (getPaddedValue(strip, x + 1, y + 1) >= THRESHOLD ? 4 : 0) |
  (getPaddedValue(strip, x, y + 1) >= THRESHOLD ? 8 : 0);
