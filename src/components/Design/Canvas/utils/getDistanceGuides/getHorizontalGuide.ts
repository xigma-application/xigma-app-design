// types
import { TDistanceGuideLabel, TDistanceGuideLine, TEdges } from './types';

// utils
import { getLabel } from './getLabel';

export type THorizontalGuideResult = { label: TDistanceGuideLabel; line: TDistanceGuideLine; targetX: number };

export const getHorizontalGuide = (active: TEdges, target: TEdges, y: number): THorizontalGuideResult => {
  let x1: number;
  let x2: number;
  let targetX: number;

  if (active.right <= target.left) {
    x1 = active.right;
    x2 = target.left;
    targetX = target.left;
  } else if (target.right <= active.left) {
    x1 = target.right;
    x2 = active.left;
    targetX = target.right;
  } else {
    const targetIsLeft = target.left + target.right <= active.left + active.right;

    targetX = targetIsLeft ? target.left : target.right;
    const activeX = targetIsLeft ? active.left : active.right;

    x1 = Math.min(targetX, activeX);
    x2 = Math.max(targetX, activeX);
  }

  return { label: getLabel(x1, y, x2, y, { x: 0, y: 1 }, x2 - x1), line: { dashed: false, x1, x2, y1: y, y2: y }, targetX };
};
