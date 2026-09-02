// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAspectRatioLockedRect } from 'utils/math/getAspectRatioLockedRect';
import { roundRect } from 'utils/math/roundRect';
import { toDraftRect } from './toDraftRect';

export const getShapeDraftRect = (start: TPoint, current: TPoint, shiftKey: boolean): TDraftRect =>
  shiftKey ? roundRect(getAspectRatioLockedRect(start, current, 1)) : toDraftRect(start, current);
