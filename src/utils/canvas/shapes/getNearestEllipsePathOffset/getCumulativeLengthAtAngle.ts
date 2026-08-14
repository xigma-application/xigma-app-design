// others
import { TWO_PI } from './constants';

// types
import { TEllipseArcLengthSample } from 'types/canvas';

export const getCumulativeLengthAtAngle = (angle: number, table: TEllipseArcLengthSample[]): number => {
  const segments = table.length - 1;
  const exactIndex = (angle / TWO_PI) * segments;
  const lowerIndex = Math.floor(exactIndex);
  const upperIndex = Math.min(lowerIndex + 1, table.length - 1);
  const fraction = exactIndex - lowerIndex;

  return table[lowerIndex].cumulativeLength + fraction * (table[upperIndex].cumulativeLength - table[lowerIndex].cumulativeLength);
};
