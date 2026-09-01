import { CSSProperties } from 'react';

// others
import { MASK_CONNECTOR_DEPTH_SHIFT_PX } from '../constants';

// every line is drawn in the anchor's own column: pulled back left by one indent-width per
// nesting level below that anchor, so it stays aligned regardless of how deep this row is
export const getShiftedLeftStyle = (basePx: number, depthOffset: number): CSSProperties | undefined => {
  const shift = depthOffset * MASK_CONNECTOR_DEPTH_SHIFT_PX;

  return shift > 0 ? { left: `calc(${basePx}px - ${shift}px)` } : undefined;
};
