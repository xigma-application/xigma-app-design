// types
import { TBrushAlpha } from '../types';
import { TStripFrame } from './types';

// utils
import { sampleBrushAlpha } from '../sampleBrushAlpha';

export const getStripSamples = (alpha: TBrushAlpha, frames: TStripFrame[], halfWidth: number): Float32Array => {
  const height = halfWidth * 2 + 1;
  const data = new Float32Array(frames.length * height);

  frames.forEach((frame, column) => {
    for (let row = 0; row < height; row += 1) {
      const offset = row - halfWidth;

      data[row * frames.length + column] = sampleBrushAlpha(alpha, frame.x + frame.normal.x * offset, frame.y + frame.normal.y * offset);
    }
  });

  return data;
};
