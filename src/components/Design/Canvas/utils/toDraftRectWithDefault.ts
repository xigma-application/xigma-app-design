// others
import { MIN_SHAPE_SIZE } from '../constants';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { roundRect } from 'utils/math/roundRect';
import { toDraftRect } from './toDraftRect';

export const toDraftRectWithDefault = (start: TPoint, current: TPoint, defaultSize: number, centered: boolean): TDraftRect => {
  const isTooSmall = Math.abs(current.x - start.x) < MIN_SHAPE_SIZE || Math.abs(current.y - start.y) < MIN_SHAPE_SIZE;

  if (isTooSmall) {
    const offset = centered ? defaultSize / 2 : 0;

    return roundRect({ height: defaultSize, width: defaultSize, x: start.x - offset, y: start.y - offset });
  }

  return toDraftRect(start, current);
};
