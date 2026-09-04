// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { computeResizedRect } from '../../../../../utils/computeResizedRect';
import { getResizeAxisAnchors } from '../../../../../utils/getResizeAxisAnchors';
import { getSignedScale } from './getSignedScale';

export type TResizeFactors = {
  anchors: { x: number | null; y: number | null };
  scaleX: number;
  scaleY: number;
};

export const getResizeFactors = (handle: TResizeHandle, bounds: TDraftRect, point: TPoint): TResizeFactors => {
  const newBounds = computeResizedRect(handle, bounds, point);
  const anchors = getResizeAxisAnchors(handle, bounds);

  return {
    anchors,
    scaleX: getSignedScale(newBounds.x, newBounds.width, bounds.x, bounds.width, anchors.x),
    scaleY: getSignedScale(newBounds.y, newBounds.height, bounds.y, bounds.height, anchors.y),
  };
};
