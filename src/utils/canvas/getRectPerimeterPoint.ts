// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getRectCorners } from './getRectCorners';

export const getRectPerimeterPoint = (rect: TDraftRect, distance: number): TPoint => {
  const corners = getRectCorners(rect);
  const edgeLengths = [rect.width, rect.height, rect.width, rect.height];
  let remaining = distance;

  for (let edgeIndex = 0; edgeIndex < edgeLengths.length; edgeIndex++) {
    const edgeLength = edgeLengths[edgeIndex];

    if (remaining <= edgeLength) {
      const start = corners[edgeIndex];
      const end = corners[(edgeIndex + 1) % corners.length];
      const t = edgeLength === 0 ? 0 : remaining / edgeLength;

      return { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t };
    }

    remaining -= edgeLength;
  }

  return corners[0];
};
