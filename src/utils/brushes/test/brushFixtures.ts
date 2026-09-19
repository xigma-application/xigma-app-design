// types
import { TBrushAlpha } from '../types';

export const createAlpha = (width: number, height: number, isOpaque: (x: number, y: number) => boolean): TBrushAlpha => {
  const data = new Float32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      data[y * width + x] = isOpaque(x, y) ? 1 : 0;
    }
  }

  return { data, height, width };
};

export const straightBand = createAlpha(200, 60, (x, y) => x >= 10 && x < 190 && y >= 20 && y < 40);

export const wavyBand = createAlpha(400, 100, (x, y) => x >= 10 && x < 390 && Math.abs(y - (50 + 20 * Math.sin(x / 60))) < 6);
