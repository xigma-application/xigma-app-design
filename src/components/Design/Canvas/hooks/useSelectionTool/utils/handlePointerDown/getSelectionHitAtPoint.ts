// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../../utils/getNodeAtPoint';

export const getSelectionHitAtPoint = (point: TPoint, orderedNodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const hit = getNodeAtPoint(point, orderedNodes, viewport);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(store.getState());

  return hit && vectorEditingNodeIds.includes(hit.id) ? null : hit;
};
