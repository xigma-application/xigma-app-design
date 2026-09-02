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
      lines: [{ dashed: false, x1: a.x, x2: b.x, y1: a.y, y2: b.y }],
    };
  }

  const cornerOnARow = { x: b.x, y: a.y }; // shares a's row, b's column
  const cornerOnACol = { x: a.x, y: b.y }; // shares a's column, b's row

  return {
    labels: [
      getLabel(a.x, a.y, cornerOnARow.x, cornerOnARow.y, { x: 0, y: -Math.sign(dy) }, Math.abs(dx)),
      getLabel(a.x, a.y, cornerOnACol.x, cornerOnACol.y, { x: -Math.sign(dx), y: 0 }, Math.abs(dy)),
    ],
    lines: [
      { dashed: false, x1: a.x, x2: cornerOnARow.x, y1: a.y, y2: cornerOnARow.y },
      { dashed: true, x1: cornerOnARow.x, x2: b.x, y1: cornerOnARow.y, y2: b.y },
      { dashed: false, x1: a.x, x2: cornerOnACol.x, y1: a.y, y2: cornerOnACol.y },
      { dashed: true, x1: cornerOnACol.x, x2: b.x, y1: cornerOnACol.y, y2: b.y },
    ],
  };
};
