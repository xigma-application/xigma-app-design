// store
import { selectNodes, selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGroupChildHitAtPoint } from './getGroupChildHitAtPoint';
import { getNodeAtPoint } from '../../../../utils/getNodeAtPoint';
import { isSelectionInsideGroup } from '../../../../utils/isSelectionInsideGroup';

export const getSelectionHitAtPoint = (point: TPoint, orderedNodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const state = store.getState();
  const selectedNodes = selectSelectedNodes(state);
  const selectedHit = getNodeAtPoint(point, selectedNodes, viewport);

  if (!selectedHit) {
    const hit = getNodeAtPoint(point, orderedNodes, viewport);

    if (hit && hit.type === NodeType.group) {
      const childHit = getGroupChildHitAtPoint(point, viewport);

      if (childHit && isSelectionInsideGroup(hit.id, selectedNodes, selectNodes(state))) {
        return childHit;
      }
    }

    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    return hit && vectorEditingNodeIds.includes(hit.id) ? null : hit;
  }

  return selectedHit;
};
