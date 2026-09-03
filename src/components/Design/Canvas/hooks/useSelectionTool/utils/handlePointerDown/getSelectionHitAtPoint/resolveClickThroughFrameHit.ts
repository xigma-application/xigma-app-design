// utils
import { getClickThroughFrameChildHit } from './getClickThroughFrameChildHit';
import { isClickThroughFrameBody } from './isClickThroughFrameBody';

// types
import { TSelectionHitResolver } from './types';

export const resolveClickThroughFrameHit: TSelectionHitResolver = ({ hit, nodesById, point, viewport }) => {
  if (hit && isClickThroughFrameBody(hit, nodesById, point, viewport.zoom)) {
    return { node: getClickThroughFrameChildHit(hit, point, viewport, nodesById) };
  }
};
