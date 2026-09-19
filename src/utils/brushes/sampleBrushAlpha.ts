// types
import { TBrushAlpha } from './types';

const getPixel = (alpha: TBrushAlpha, x: number, y: number): number =>
  x < 0 || y < 0 || x >= alpha.width || y >= alpha.height ? 0 : alpha.data[y * alpha.width + x];

export const sampleBrushAlpha = (alpha: TBrushAlpha, x: number, y: number): number => {
  const left = Math.floor(x);
  const top = Math.floor(y);
  const fx = x - left;
  const fy = y - top;
  const upper = getPixel(alpha, left, top) * (1 - fx) + getPixel(alpha, left + 1, top) * fx;
  const lower = getPixel(alpha, left, top + 1) * (1 - fx) + getPixel(alpha, left + 1, top + 1) * fx;

  return upper * (1 - fy) + lower * fy;
};
