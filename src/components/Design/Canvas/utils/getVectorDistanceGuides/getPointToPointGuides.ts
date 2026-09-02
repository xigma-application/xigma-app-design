// types
import { TPoint } from 'types/canvas';
import { TVectorDistanceGuideParts } from './types';

// utils
import { getLabel } from '../getDistanceGuides/getLabel';

const EPS = 1e-6;

export const getPointToPointGuides = (a: TPoint, b: TPoint): TVectorDistanceGuideParts => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (Math.abs(dx) < EPS && Math.abs(dy) < EPS) {
    return { labels: [], lines: [] };
  }

  if (Math.abs(dx) < EPS || Math.abs(dy) < EPS) {
    const offsetDirection = Math.abs(dx) < EPS ? { x: 1, y: 0 } : { x: 0, y: -1 };

    return {
      labels: [getLabel(a.x, a.y, b.x, b.y, offsetDirection, Math.hypot(dx, dy))],
      lines: [{ dashed: true, x1: a.x, x2: b.x, y1: a.y, y2: b.y }],
    };
  }

  const corner = { x: b.x, y: a.y };

  return {
    labels: [
      getLabel(a.x, a.y, corner.x, corner.y, { x: 0, y: -1 }, Math.abs(dx)),
      getLabel(corner.x, corner.y, b.x, b.y, { x: 1, y: 0 }, Math.abs(dy)),
    ],
    lines: [
      { dashed: true, x1: a.x, x2: corner.x, y1: a.y, y2: corner.y },
      { dashed: true, x1: corner.x, x2: b.x, y1: corner.y, y2: b.y },
    ],
  };
};
