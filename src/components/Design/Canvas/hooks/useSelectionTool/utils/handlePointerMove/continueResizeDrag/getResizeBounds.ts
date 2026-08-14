// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { computeResizedRect } from '../../../../../utils/computeResizedRect';
import { getAspectRatioLockedRect } from 'utils/math/getAspectRatioLockedRect';

export const getResizeBounds = (
  handle: TResizeHandle,
  bounds: TDraftRect,
  point: TPoint,
  cornerAnchor: TPoint | null,
  aspectRatio: number,
  shiftKey: boolean,
): TDraftRect =>
  cornerAnchor && shiftKey ? getAspectRatioLockedRect(cornerAnchor, point, aspectRatio) : computeResizedRect(handle, bounds, point);
