// others
import { EQUAL_SPACING_TOLERANCE_PX } from 'constant/canvas';

// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingGuides } from './types';
import { TVerticalNeighbors } from './findVerticalNeighbors';

// utils
import { getVerticalGuide } from '../getDistanceGuides/getVerticalGuide';

const NO_GUIDES: TEqualSpacingGuides = { labels: [], lines: [] };

const getBandX = (active: TEdges, target: TEdges): number =>
  (Math.max(active.left, target.left) + Math.min(active.right, target.right)) / 2;

export const getVerticalEqualSpacingGuide = (active: TEdges, neighbors: TVerticalNeighbors): TEqualSpacingGuides => {
  const { bottom, top } = neighbors;

  if (!top || !bottom) {
    return NO_GUIDES;
  }

  const gapTop = active.top - top.bottom;
  const gapBottom = bottom.top - active.bottom;

  if (gapTop <= 0 || gapBottom <= 0 || Math.abs(gapTop - gapBottom) > EQUAL_SPACING_TOLERANCE_PX) {
    return NO_GUIDES;
  }

  const topGuide = getVerticalGuide(active, top, getBandX(active, top));
  const bottomGuide = getVerticalGuide(active, bottom, getBandX(active, bottom));

  return { labels: [topGuide.label, bottomGuide.label], lines: [topGuide.line, bottomGuide.line] };
};
