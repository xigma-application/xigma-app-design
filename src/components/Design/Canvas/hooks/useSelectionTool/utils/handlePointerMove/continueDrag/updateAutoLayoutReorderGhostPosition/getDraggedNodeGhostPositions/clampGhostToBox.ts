// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { clamp } from 'utils/math/clamp';

export const clampGhostToBox = (point: TPoint, box: TDraftRect | undefined, width: number, height: number): TPoint => {
  if (box) {
    return {
      x: clamp(point.x, box.x, Math.max(box.x, box.x + box.width - width)),
      y: clamp(point.y, box.y, Math.max(box.y, box.y + box.height - height)),
    };
  }

  return point;
};
