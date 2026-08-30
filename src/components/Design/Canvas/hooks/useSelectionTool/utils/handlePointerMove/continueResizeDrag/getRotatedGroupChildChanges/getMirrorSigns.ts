// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { rotatePoint } from 'utils/math/rotatePoint';

const CORNER_SIDE = [
  { lr: 0, tb: 0 },
  { lr: 1, tb: 0 },
  { lr: 1, tb: 1 },
  { lr: 0, tb: 1 },
];

export const getMirrorSigns = (before: TDraftRect, after: TDraftRect, rotation: number): TPoint => {
  const oldCenter: TPoint = { x: before.x + before.width / 2, y: before.y + before.height / 2 };
  const newCenter: TPoint = { x: after.x + after.width / 2, y: after.y + after.height / 2 };
  const oldCorners = getRectCorners(before).map((corner) => rotatePoint(corner, oldCenter, rotation));
  const newCorners = getRectCorners(after).map((corner) => rotatePoint(corner, newCenter, rotation));

  let matchedOldIndex = 0;
  let matchedNewIndex = 0;
  let bestDistance = Infinity;

  oldCorners.forEach((oldCorner, oldIndex) => {
    newCorners.forEach((newCorner, newIndex) => {
      const distance = Math.hypot(oldCorner.x - newCorner.x, oldCorner.y - newCorner.y);

      if (distance < bestDistance) {
        bestDistance = distance;
        matchedOldIndex = oldIndex;
        matchedNewIndex = newIndex;
      }
    });
  });

  return {
    x: CORNER_SIDE[matchedOldIndex].lr === CORNER_SIDE[matchedNewIndex].lr ? 1 : -1,
    y: CORNER_SIDE[matchedOldIndex].tb === CORNER_SIDE[matchedNewIndex].tb ? 1 : -1,
  };
};
