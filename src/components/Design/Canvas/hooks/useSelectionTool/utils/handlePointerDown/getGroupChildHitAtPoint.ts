// store
import { selectRenderOrderedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../../utils/getNodeAtPoint';

export const getGroupChildHitAtPoint = (point: TPoint, viewport: TViewport): TSceneNode | null => {
  const state = store.getState();
  const leafNodes = selectRenderOrderedNodes(state).filter((node) => node.type !== NodeType.group);
  const hit = getNodeAtPoint(point, leafNodes, viewport);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  return hit && hit.parentId && !vectorEditingNodeIds.includes(hit.id) ? hit : null;
};
