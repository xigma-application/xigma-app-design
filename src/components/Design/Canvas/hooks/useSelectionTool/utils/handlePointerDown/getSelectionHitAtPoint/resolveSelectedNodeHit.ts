// store
import { isAncestorNode } from 'store/design/utils/nodeHierarchy/isAncestorNode';

// utils
import { getGroupChildHitAtPoint } from '../getGroupChildHitAtPoint';
import { isClickThroughFrameBody } from './isClickThroughFrameBody';

// types
import { TSelectionHitResolver } from './types';

export const resolveSelectedNodeHit: TSelectionHitResolver = ({ hit, nodesById, point, selectedHit, viewport }) => {
  if (selectedHit && (!hit || hit.id === selectedHit.id || isAncestorNode(hit.id, selectedHit, nodesById))) {
    if (isClickThroughFrameBody(selectedHit, point, viewport.zoom)) {
      const childHit = getGroupChildHitAtPoint(point, viewport);

      if (childHit) {
        return { node: childHit };
      }
    }

    return { node: selectedHit };
  }
};
