// types
import { TDistanceGuides, TEdges } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getHorizontalGapSideInsets } from './getHorizontalGapSideInsets';
import { getHorizontalGuide } from './getHorizontalGuide';

export const getVerticalOverlapGuides = (active: TEdges, target: TEdges, activeRect: TDraftRect): TDistanceGuides => {
  const bandY = (Math.max(active.top, target.top) + Math.min(active.bottom, target.bottom)) / 2;
  const { label, line } = getHorizontalGuide(active, target, bandY);
  const sideInsets = getHorizontalGapSideInsets(active, target, activeRect);

  return { labels: [label, ...sideInsets.labels], lines: [line, ...sideInsets.lines] };
};
