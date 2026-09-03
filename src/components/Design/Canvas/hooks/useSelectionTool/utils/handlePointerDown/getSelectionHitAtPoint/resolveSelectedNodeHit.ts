// store
import { isAncestorNode } from 'store/design/utils/nodeHierarchy/isAncestorNode';

// utils
import { getClickThroughFrameChildHit } from './getClickThroughFrameChildHit';
import { shouldDrillIntoSelectedFrame } from './shouldDrillIntoSelectedFrame';

// types
import { TSelectionHitResolver } from './types';

export const resolveSelectedNodeHit: TSelectionHitResolver = ({ hit, nodesById, point, selectedHit, viewport }) => {
  if (selectedHit && (!hit || hit.id === selectedHit.id || isAncestorNode(hit.id, selectedHit, nodesById))) {
    if (shouldDrillIntoSelectedFrame(selectedHit, nodesById, point, viewport.zoom)) {
      const childHit = getClickThroughFrameChildHit(selectedHit, point, viewport, nodesById);

      if (childHit) {
        return { node: childHit };
      }
    }

    return { node: selectedHit };
  }
};
