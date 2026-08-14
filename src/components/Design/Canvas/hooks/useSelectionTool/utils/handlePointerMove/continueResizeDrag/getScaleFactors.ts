// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TResizeFactors } from './getResizeFactors';

// utils
import { HANDLE_AXES } from '../../../../../utils/getResizeAxisAnchors';
import { getScaleAxisAnchors } from '../../../../../utils/getScaleAxisAnchors';
import { getScaleAxisScale } from './getScaleAxisScale';
import { getScaleBounds } from './getScaleBounds';

export const getScaleFactors = (handle: TResizeHandle, bounds: TDraftRect, point: TPoint, aspectRatio: number): TResizeFactors => {
  const anchor = getScaleAxisAnchors(handle, bounds);
  const axes = HANDLE_AXES[handle];
  const newBounds = getScaleBounds(handle, bounds, point, aspectRatio);

  return {
    anchors: anchor,
    scaleX: getScaleAxisScale(axes.x, newBounds.x, newBounds.width, bounds.x, bounds.width, anchor.x),
    scaleY: getScaleAxisScale(axes.y, newBounds.y, newBounds.height, bounds.y, bounds.height, anchor.y),
  };
};
