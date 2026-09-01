// types
import { TDistanceGuideLabel, TDistanceGuideLine, TEdges } from './types';

// utils
import { getLabel } from './getLabel';

export const getVerticalGuide = (active: TEdges, target: TEdges, x: number): { label: TDistanceGuideLabel; line: TDistanceGuideLine } => {
  const [y1, y2] = active.bottom <= target.top ? [active.bottom, target.top] : [target.bottom, active.top];

  return { label: getLabel(x, y1, x, y2, { x: -1, y: 0 }, y2 - y1), line: { dashed: false, x1: x, x2: x, y1, y2 } };
};
