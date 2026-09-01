// types
import { TDistanceGuides } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getContainmentBranchGuides } from './getContainmentBranchGuides';
import { getDiagonalGuides } from './getDiagonalGuides';
import { getEdges } from './getEdges';
import { getHorizontalOverlapGuides } from './getHorizontalOverlapGuides';
import { getOverlap } from './getOverlap';
import { getVerticalOverlapGuides } from './getVerticalOverlapGuides';
import { isAxisContained } from './isAxisContained';

export const getDistanceGuides = (activeRect: TDraftRect, targetRect: TDraftRect): TDistanceGuides => {
  const active = getEdges(activeRect);
  const target = getEdges(targetRect);
  const horizontalOverlap = getOverlap(active.left, active.right, target.left, target.right);
  const verticalOverlap = getOverlap(active.top, active.bottom, target.top, target.bottom);

  const guides = ((): TDistanceGuides => {
    switch (true) {
      case horizontalOverlap > 0 && verticalOverlap > 0:
        return getContainmentBranchGuides(active, target, activeRect, targetRect);
      case isAxisContained(active.top, active.bottom, target.top, target.bottom):
        return getVerticalOverlapGuides(active, target, activeRect);
      case isAxisContained(active.left, active.right, target.left, target.right):
        return getHorizontalOverlapGuides(active, target, activeRect);
      default:
        return getDiagonalGuides(active, target, activeRect);
    }
  })();

  return { ...guides, activeRect, targetRect };
};
