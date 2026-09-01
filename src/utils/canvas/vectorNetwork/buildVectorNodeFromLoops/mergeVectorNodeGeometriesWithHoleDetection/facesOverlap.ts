// types
import { TNodeFace } from './types';

// utils
import { boundariesCross } from './boundariesCross';
import { boundsOverlap } from './boundsOverlap';
import { isFullyContained } from './isFullyContained';

export const facesOverlap = (a: TNodeFace, b: TNodeFace): boolean => {
  if (a.key === b.key || !boundsOverlap(a.bounds, b.bounds)) {
    return false;
  }

  return isFullyContained(a, b) || isFullyContained(b, a) || boundariesCross(a.points, b.points);
};
