// types
import { TPatternPaint } from 'types/design/paint/types';

export const getPatternHexOffsetAxis = (paint: TPatternPaint): number => {
  if (paint.tileType !== 'hexagonal') {
    return 0;
  }

  return paint.direction === 'horizontal' ? 1 : 2;
};
