// others
import { OPAQUE, THICKNESS_PERCENTILE } from './constants';

const getColumnThickness = (data: Float32Array, column: number, length: number, height: number): number | null => {
  let top = -1;
  let bottom = -1;

  for (let row = 0; row < height; row += 1) {
    if (data[row * length + column] > OPAQUE) {
      top = top === -1 ? row : top;
      bottom = row;
    }
  }

  return top === -1 ? null : bottom - top + 1;
};

export const getStripScale = (data: Float32Array, length: number, height: number): number => {
  const thicknesses = Array.from({ length }, (_, column) => getColumnThickness(data, column, length, height))
    .filter((thickness): thickness is number => thickness !== null)
    .sort((first, second) => first - second);

  return Math.max(1, (thicknesses[Math.floor((thicknesses.length - 1) * THICKNESS_PERCENTILE)] ?? 2) / 2);
};
