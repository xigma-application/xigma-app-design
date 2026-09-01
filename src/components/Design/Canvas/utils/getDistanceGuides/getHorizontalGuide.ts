// types
import { TDistanceGuideLabel, TDistanceGuideLine, TEdges } from './types';

// utils
import { getLabel } from './getLabel';

export const getHorizontalGuide = (active: TEdges, target: TEdges, y: number): { label: TDistanceGuideLabel; line: TDistanceGuideLine } => {
  const [x1, x2] = active.right <= target.left ? [active.right, target.left] : [target.right, active.left];
  return { label: getLabel(x1, y, x2, y, { x: 0, y: 1 }, x2 - x1), line: { dashed: false, x1, x2, y1: y, y2: y } };
};
