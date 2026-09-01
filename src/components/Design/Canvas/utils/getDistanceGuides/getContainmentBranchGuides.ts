// types
import { TDistanceGuides, TEdges } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getContainmentGuides } from './getContainmentGuides';
import { isRectInside } from './isRectInside';

export const getContainmentBranchGuides = (
  active: TEdges,
  target: TEdges,
  activeRect: TDraftRect,
  targetRect: TDraftRect,
): TDistanceGuides => {
  if (isRectInside(target, active)) {
    return getContainmentGuides(target, active, activeRect);
  }

  if (isRectInside(active, target)) {
    return getContainmentGuides(active, target, targetRect);
  }

  return { labels: [], lines: [] };
};
