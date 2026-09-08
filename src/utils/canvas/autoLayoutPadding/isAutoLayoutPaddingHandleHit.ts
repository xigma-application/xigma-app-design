// types
import { TAutoLayoutPaddingHandle, TAutoLayoutPaddingSide } from './types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutPaddingPerpendicularDistance } from './getAutoLayoutPaddingPerpendicularDistance';
import { getAutoLayoutPaddingPrimaryDistanceFromEdge } from './getAutoLayoutPaddingPrimaryDistanceFromEdge';

export const isAutoLayoutPaddingHandleHit = (
  side: TAutoLayoutPaddingSide,
  localPoint: TPoint,
  frame: TDraftRect,
  handle: TAutoLayoutPaddingHandle,
  toleranceWorldUnits: number,
  reachWorldUnits: number,
): boolean => {
  if (getAutoLayoutPaddingPerpendicularDistance(side, localPoint, handle.handleCenter) <= toleranceWorldUnits) {
    if (handle.value === 0) {
      const primaryDistance = getAutoLayoutPaddingPrimaryDistanceFromEdge(frame, side, localPoint);
      return primaryDistance >= -toleranceWorldUnits && primaryDistance <= reachWorldUnits;
    }

    return Math.hypot(localPoint.x - handle.handleCenter.x, localPoint.y - handle.handleCenter.y) <= toleranceWorldUnits;
  }

  return false;
};
