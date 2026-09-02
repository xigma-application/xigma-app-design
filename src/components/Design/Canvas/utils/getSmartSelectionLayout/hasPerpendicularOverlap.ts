// types
import { TDraftRect } from 'types/canvas';

// utils
import { getOverlap } from '../getDistanceGuides/getOverlap';

export const hasPerpendicularOverlap = (a: TDraftRect, b: TDraftRect, axis: 'x' | 'y'): boolean => {
  if (axis === 'x') {
    return getOverlap(a.y, a.y + a.height, b.y, b.y + b.height) > 0;
  }

  return getOverlap(a.x, a.x + a.width, b.x, b.x + b.width) > 0;
};
