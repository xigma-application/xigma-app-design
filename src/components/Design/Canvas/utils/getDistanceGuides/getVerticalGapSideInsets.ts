// types
import { TDistanceGuideLabel, TDistanceGuideLine, TEdges } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getLabel } from './getLabel';

export const getVerticalGapSideInsets = (
  active: TEdges,
  target: TEdges,
  activeRect: TDraftRect,
): { labels: TDistanceGuideLabel[]; lines: TDistanceGuideLine[] } => {
  const activeIsAbove = active.bottom <= target.top;
  const dashedY1 = activeIsAbove ? active.top : active.bottom;
  const dashedY2 = activeIsAbove ? target.top : target.bottom;
  const insetY = activeRect.y + activeRect.height / 2;
  const lines: TDistanceGuideLine[] = [];
  const labels: TDistanceGuideLabel[] = [];

  [[active.left, target.left] as const, [active.right, target.right] as const].forEach(([activeEdge, targetEdge]) => {
    if (activeEdge !== targetEdge) {
      const [x1, x2] = activeEdge < targetEdge ? [activeEdge, targetEdge] : [targetEdge, activeEdge];

      lines.push(
        { dashed: true, x1: targetEdge, x2: targetEdge, y1: dashedY1, y2: dashedY2 },
        { dashed: false, x1, x2, y1: insetY, y2: insetY },
      );
      labels.push(getLabel(x1, insetY, x2, insetY, { x: 0, y: 1 }, x2 - x1));
    }
  });

  return { labels, lines };
};
