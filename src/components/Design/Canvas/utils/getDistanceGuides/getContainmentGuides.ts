// types
import { TDistanceGuideLine, TDistanceGuides, TEdges } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getLabel } from './getLabel';

export const getContainmentGuides = (outer: TEdges, inner: TEdges, innerRect: TDraftRect): TDistanceGuides => {
  const centerX = innerRect.x + innerRect.width / 2;
  const centerY = innerRect.y + innerRect.height / 2;
  const lines: TDistanceGuideLine[] = [];
  const labels: TDistanceGuides['labels'] = [];

  if (outer.top !== inner.top) {
    lines.push({ dashed: false, x1: centerX, x2: centerX, y1: outer.top, y2: inner.top });
    labels.push(getLabel(centerX, outer.top, centerX, inner.top, { x: -1, y: 0 }, inner.top - outer.top));
  }

  if (outer.bottom !== inner.bottom) {
    lines.push({ dashed: false, x1: centerX, x2: centerX, y1: inner.bottom, y2: outer.bottom });
    labels.push(getLabel(centerX, inner.bottom, centerX, outer.bottom, { x: -1, y: 0 }, outer.bottom - inner.bottom));
  }

  if (outer.left !== inner.left) {
    lines.push({ dashed: false, x1: outer.left, x2: inner.left, y1: centerY, y2: centerY });
    labels.push(getLabel(outer.left, centerY, inner.left, centerY, { x: 0, y: 1 }, inner.left - outer.left));
  }

  if (outer.right !== inner.right) {
    lines.push({ dashed: false, x1: inner.right, x2: outer.right, y1: centerY, y2: centerY });
    labels.push(getLabel(inner.right, centerY, outer.right, centerY, { x: 0, y: 1 }, outer.right - inner.right));
  }

  return { labels, lines };
};
