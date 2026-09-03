// utils
import { getGroupChildHitAtPoint } from '../getGroupChildHitAtPoint';
import { isClickThroughFrameBody } from './isClickThroughFrameBody';

// types
import { TSelectionHitResolver } from './types';

export const resolveClickThroughFrameHit: TSelectionHitResolver = ({ hit, point, viewport }) => {
  if (hit && isClickThroughFrameBody(hit, point, viewport.zoom)) {
    return { node: getGroupChildHitAtPoint(point, viewport) };
  }
};
