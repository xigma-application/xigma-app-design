// types
import { TDistanceGuideLabel, TDistanceGuideLine, TEdges } from './types';

// utils
import { getLabel } from './getLabel';

export type TVerticalGuideResult = { label: TDistanceGuideLabel; line: TDistanceGuideLine; targetY: number };

export const getVerticalGuide = (active: TEdges, target: TEdges, x: number): TVerticalGuideResult => {
  let y1: number;
  let y2: number;
  let targetY: number;

  if (active.bottom <= target.top) {
    y1 = active.bottom;
    y2 = target.top;
    targetY = target.top;
  } else if (target.bottom <= active.top) {
    y1 = target.bottom;
    y2 = active.top;
    targetY = target.bottom;
  } else {
    const targetIsAbove = target.top + target.bottom <= active.top + active.bottom;

    targetY = targetIsAbove ? target.top : target.bottom;
    const activeY = targetIsAbove ? active.top : active.bottom;

    y1 = Math.min(targetY, activeY);
    y2 = Math.max(targetY, activeY);
  }

  return { label: getLabel(x, y1, x, y2, { x: -1, y: 0 }, y2 - y1), line: { dashed: false, x1: x, x2: x, y1, y2 }, targetY };
};
