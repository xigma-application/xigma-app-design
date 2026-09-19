// types
import { TBrushStrip } from '../../types';

export const createStrip = (length: number, height: number, isInside: (column: number, row: number) => boolean): TBrushStrip => {
  const data = new Float32Array(length * height);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < length; column += 1) {
      data[row * length + column] = isInside(column, row) ? 1 : 0;
    }
  }

  return { data, halfWidth: (height - 1) / 2, height, length, scale: (height - 1) / 2 };
};
