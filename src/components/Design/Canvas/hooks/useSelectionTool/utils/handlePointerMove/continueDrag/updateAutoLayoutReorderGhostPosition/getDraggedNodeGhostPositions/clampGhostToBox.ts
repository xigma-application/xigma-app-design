// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { clamp } from 'utils/math/clamp';
import { rotatePoint } from 'utils/math/rotatePoint';

export const clampGhostToBox = (
  point: TPoint,
  box: TDraftRect | undefined,
  width: number,
  height: number,
  rotation = 0,
  rotationCenter?: TPoint,
): TPoint => {
  if (box) {
    const center = rotationCenter ?? { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const localPoint = rotatePoint(point, center, -rotation);
    const clampedLocal = {
      x: clamp(localPoint.x, box.x, Math.max(box.x, box.x + box.width - width)),
      y: clamp(localPoint.y, box.y, Math.max(box.y, box.y + box.height - height)),
    };

    return rotatePoint(clampedLocal, center, rotation);
  }

  return point;
};
