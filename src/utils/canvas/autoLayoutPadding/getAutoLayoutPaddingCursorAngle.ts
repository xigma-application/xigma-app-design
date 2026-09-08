// types
import { TAutoLayoutPaddingSide } from './types';

const ZERO_PADDING_ANGLE_OFFSET_BY_SIDE: Record<TAutoLayoutPaddingSide, number> = {
  bottom: 90,
  left: 180,
  right: 0,
  top: -90,
};

export const getAutoLayoutPaddingCursorAngle = (side: TAutoLayoutPaddingSide, frameRotation: number, isZeroPadding: boolean): number => {
  if (isZeroPadding) {
    return frameRotation + ZERO_PADDING_ANGLE_OFFSET_BY_SIDE[side];
  }

  return side === 'top' || side === 'bottom' ? frameRotation : frameRotation + 90;
};
