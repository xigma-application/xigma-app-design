// others
import { MIN_SCROLLBAR_THUMB_PX } from '../../constants';

// utils
import { clamp } from 'utils/math/clamp';

export type TScrollbarThumb = {
  offset: number;
  size: number;
};

export const getScrollbarThumb = (
  trackLength: number,
  visibleOffset: number,
  visibleLength: number,
  rangeOffset: number,
  rangeLength: number,
): TScrollbarThumb => {
  const size = clamp((visibleLength / rangeLength) * trackLength, Math.min(MIN_SCROLLBAR_THUMB_PX, trackLength), trackLength);
  const offset = clamp(((visibleOffset - rangeOffset) / rangeLength) * trackLength, 0, trackLength - size);

  return { offset, size };
};
