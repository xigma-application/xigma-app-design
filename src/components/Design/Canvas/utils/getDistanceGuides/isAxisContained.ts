// utils
import { isRangeInside } from './isRangeInside';

export const isAxisContained = (aStart: number, aEnd: number, bStart: number, bEnd: number): boolean =>
  isRangeInside(aStart, aEnd, bStart, bEnd) || isRangeInside(bStart, bEnd, aStart, aEnd);
