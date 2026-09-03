// types
import { NodeType } from 'types/design/enums';
import { TSelectionHitResolver } from './types';

// utils
import { getClickThroughFrameChildHit } from './getClickThroughFrameChildHit';

export const resolveContainerFrameDrillHit: TSelectionHitResolver = ({ hit, nodesById, point, viewport }) => {
  if (hit && hit.type === NodeType.section) {
    const childHit = getClickThroughFrameChildHit(hit, point, viewport, nodesById);

    if (childHit) {
      return { node: childHit };
    }
  }
};
