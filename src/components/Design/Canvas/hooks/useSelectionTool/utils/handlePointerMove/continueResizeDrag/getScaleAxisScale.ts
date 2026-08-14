// types
import { TAxisAnchorSide } from '../../../../../utils/getResizeAxisAnchors';

// utils
import { getSignedScale } from './getSignedScale';

export const getScaleAxisScale = (
  side: TAxisAnchorSide,
  newStart: number,
  newSize: number,
  originStart: number,
  originSize: number,
  anchor: number,
): number => {
  if (side === 'none') {
    return newSize / originSize;
  }

  return getSignedScale(newStart, newSize, originStart, originSize, anchor);
};
