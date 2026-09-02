// others
import { MIN_DRAG_DISTANCE_PX } from '../constants';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getShapeDraftRect } from './getShapeDraftRect';
import { roundRect } from 'utils/math/roundRect';

export const toDraftRectWithDefault = (
  start: TPoint,
  current: TPoint,
  defaultSize: number,
  centered: boolean,
  zoom: number,
  shiftKey = false,
): TDraftRect => {
  const isTooSmall =
    Math.abs(current.x - start.x) * zoom < MIN_DRAG_DISTANCE_PX || Math.abs(current.y - start.y) * zoom < MIN_DRAG_DISTANCE_PX;

  if (isTooSmall) {
    const offset = centered ? defaultSize / 2 : 0;
    return roundRect({ height: defaultSize, width: defaultSize, x: start.x - offset, y: start.y - offset });
  }

  return getShapeDraftRect(start, current, shiftKey);
};
