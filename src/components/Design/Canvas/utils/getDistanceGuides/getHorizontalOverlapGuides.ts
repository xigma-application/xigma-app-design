// types
import { TDistanceGuides, TEdges } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getVerticalGapSideInsets } from './getVerticalGapSideInsets';
import { getVerticalGuide } from './getVerticalGuide';

export const getHorizontalOverlapGuides = (active: TEdges, target: TEdges, activeRect: TDraftRect): TDistanceGuides => {
  const bandX = (Math.max(active.left, target.left) + Math.min(active.right, target.right)) / 2;
  const { label, line } = getVerticalGuide(active, target, bandX);
  const sideInsets = getVerticalGapSideInsets(active, target, activeRect);

  return { labels: [label, ...sideInsets.labels], lines: [line, ...sideInsets.lines] };
};
