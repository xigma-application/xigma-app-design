// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { getResizeAnchorPoint } from '../../../../../utils/getResizeAnchorPoint';
import { getResizeAxisAnchors } from '../../../../../utils/getResizeAxisAnchors';
import { getResizeBounds } from './getResizeBounds';
import { getSignedScale } from './getSignedScale';

export type TResizeFactors = {
  anchors: { x: number | null; y: number | null };
  scaleX: number;
  scaleY: number;
};

export const getResizeFactors = (
  handle: TResizeHandle,
  bounds: TDraftRect,
  point: TPoint,
  aspectRatio: number,
  shiftKey: boolean,
): TResizeFactors => {
  const cornerAnchor = getResizeAnchorPoint(handle, bounds);
  const newBounds = getResizeBounds(handle, bounds, point, cornerAnchor, aspectRatio, shiftKey);
  const anchors = getResizeAxisAnchors(handle, bounds);

  return {
    anchors,
    scaleX: getSignedScale(newBounds.x, newBounds.width, bounds.x, bounds.width, anchors.x),
    scaleY: getSignedScale(newBounds.y, newBounds.height, bounds.y, bounds.height, anchors.y),
  };
};
