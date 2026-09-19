// types
import { TBrushAlpha } from '../types';
import { TStripFrame } from './types';

// others
import { EXTENT_MARGIN, EXTENT_STEP, OPAQUE } from './constants';

// utils
import { sampleBrushAlpha } from '../sampleBrushAlpha';

export const getStripExtent = (alpha: TBrushAlpha, frames: TStripFrame[]): number => {
  const reach = Math.ceil(alpha.height / 2) + EXTENT_MARGIN;
  let extent = 0;

  frames.forEach((frame) => {
    for (let offset = -reach; offset <= reach; offset += EXTENT_STEP) {
      if (sampleBrushAlpha(alpha, frame.x + frame.normal.x * offset, frame.y + frame.normal.y * offset) > OPAQUE) {
        extent = Math.max(extent, Math.abs(offset));
      }
    }
  });

  return extent;
};
