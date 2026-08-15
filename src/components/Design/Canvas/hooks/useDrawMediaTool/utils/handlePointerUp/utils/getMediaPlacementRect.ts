// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAspectRatioLockedRect } from 'utils/math/getAspectRatioLockedRect';
import { getCenteredMediaRect } from './getCenteredMediaRect';
import { roundRect } from 'utils/math/roundRect';

export const getMediaPlacementRect = (
  isClick: boolean,
  start: TPoint,
  current: TPoint,
  naturalWidth: number,
  naturalHeight: number,
): TDraftRect => {
  if (isClick) {
    return roundRect(getCenteredMediaRect(start, naturalWidth, naturalHeight));
  }

  return roundRect(getAspectRatioLockedRect(start, current, naturalWidth / naturalHeight));
};
