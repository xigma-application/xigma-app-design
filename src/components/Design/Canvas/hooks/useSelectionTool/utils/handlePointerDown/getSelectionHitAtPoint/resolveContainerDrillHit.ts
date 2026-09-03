// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

// utils
import { getGroupChildHitAtPoint } from '../getGroupChildHitAtPoint';
import { isSelectionInsideGroup } from '../../../../../utils/isSelectionInsideGroup';

// types
import { TSelectionHitResolver } from './types';

export const resolveContainerDrillHit: TSelectionHitResolver = ({ hit, nodesById, point, selectedNodes, viewport }) => {
  if (hit && isContainerNode(hit)) {
    const childHit = getGroupChildHitAtPoint(point, viewport);

    if (childHit && isSelectionInsideGroup(hit.id, selectedNodes, nodesById)) {
      return { node: childHit };
    }
  }
};
