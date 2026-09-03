// store
import { isAncestorNode } from 'store/design/utils/nodeHierarchy/isAncestorNode';

// types
import { NodeType } from 'types/design/enums';
import { TSelectionHitResolver } from './types';

// utils
import { getClickThroughFrameChildHit } from './getClickThroughFrameChildHit';
import { shouldDrillIntoSelectedFrame } from './shouldDrillIntoSelectedFrame';

export const resolveSelectedNodeHit: TSelectionHitResolver = ({ hit, nodesById, point, selectedHit, viewport }) => {
  if (selectedHit && (!hit || hit.id === selectedHit.id || isAncestorNode(hit.id, selectedHit, nodesById))) {
    if (shouldDrillIntoSelectedFrame(selectedHit, nodesById, point, viewport.zoom) || selectedHit.type === NodeType.section) {
      const childHit = getClickThroughFrameChildHit(selectedHit, point, viewport, nodesById);

      if (childHit) {
        return { node: childHit };
      }
    }

    return { node: selectedHit };
  }
};
