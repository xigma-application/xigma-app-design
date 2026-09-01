// types
import { TDistanceGuideLabel, TDistanceGuideLine, TEdges } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getLabel } from './getLabel';

export const getHorizontalGapSideInsets = (
  active: TEdges,
  target: TEdges,
  activeRect: TDraftRect,
): { labels: TDistanceGuideLabel[]; lines: TDistanceGuideLine[] } => {
  const activeIsLeft = active.right <= target.left;
  const dashedX1 = activeIsLeft ? active.left : active.right;
  const dashedX2 = activeIsLeft ? target.left : target.right;
  const insetX = activeRect.x + activeRect.width / 2;
  const lines: TDistanceGuideLine[] = [];
  const labels: TDistanceGuideLabel[] = [];

  [[active.top, target.top] as const, [active.bottom, target.bottom] as const].forEach(([activeEdge, targetEdge]) => {
    if (activeEdge !== targetEdge) {
      const [y1, y2] = activeEdge < targetEdge ? [activeEdge, targetEdge] : [targetEdge, activeEdge];

      lines.push(
        { dashed: true, x1: dashedX1, x2: dashedX2, y1: targetEdge, y2: targetEdge },
        { dashed: false, x1: insetX, x2: insetX, y1, y2 },
      );
      labels.push(getLabel(insetX, y1, insetX, y2, { x: -1, y: 0 }, y2 - y1));
    }
  });

  return { labels, lines };
};
