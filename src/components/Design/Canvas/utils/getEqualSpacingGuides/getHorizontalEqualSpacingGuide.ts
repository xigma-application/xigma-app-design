// others
import { EQUAL_SPACING_TOLERANCE_PX } from 'constant/canvas';

// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingGuides } from './types';
import { THorizontalNeighbors } from './findHorizontalNeighbors';

// utils
import { getHorizontalGuide } from '../getDistanceGuides/getHorizontalGuide';

const NO_GUIDES: TEqualSpacingGuides = { labels: [], lines: [] };

const getBandY = (active: TEdges, target: TEdges): number =>
  (Math.max(active.top, target.top) + Math.min(active.bottom, target.bottom)) / 2;

export const getHorizontalEqualSpacingGuide = (active: TEdges, neighbors: THorizontalNeighbors): TEqualSpacingGuides => {
  const { left, right } = neighbors;

  if (!left || !right) {
    return NO_GUIDES;
  }

  const gapLeft = active.left - left.right;
  const gapRight = right.left - active.right;

  if (gapLeft <= 0 || gapRight <= 0 || Math.abs(gapLeft - gapRight) > EQUAL_SPACING_TOLERANCE_PX) {
    return NO_GUIDES;
  }

  const leftGuide = getHorizontalGuide(active, left, getBandY(active, left));
  const rightGuide = getHorizontalGuide(active, right, getBandY(active, right));

  return { labels: [leftGuide.label, rightGuide.label], lines: [leftGuide.line, rightGuide.line] };
};
