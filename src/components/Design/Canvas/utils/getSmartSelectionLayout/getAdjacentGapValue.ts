// types
import { TDraftRect } from 'types/canvas';

export const getAdjacentGapValue = (before: TDraftRect, after: TDraftRect, axis: 'x' | 'y'): number => {
  const size = axis === 'x' ? 'width' : 'height';
  return after[axis] - (before[axis] + before[size]);
};
