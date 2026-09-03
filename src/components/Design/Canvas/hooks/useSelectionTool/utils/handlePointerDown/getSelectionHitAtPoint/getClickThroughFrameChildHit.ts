// store
import { selectRenderOrderedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { isAncestorNode } from 'store/design/utils/nodeHierarchy/isAncestorNode';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getClickThroughLeafNodes } from '../../../../../utils/getClickThroughLeafNodes';
import { getNodeAtPoint } from '../../../../../utils/getNodeAtPoint/getNodeAtPoint';

export const getClickThroughFrameChildHit = (
  frame: TSceneNode,
  point: TPoint,
  viewport: TViewport,
  nodesById: Record<string, TSceneNode>,
): TSceneNode | null => {
  const state = store.getState();
  const candidates = getClickThroughLeafNodes(selectRenderOrderedNodes(state), nodesById);
  const hit = getNodeAtPoint(point, candidates, viewport);

  return hit && isAncestorNode(frame.id, hit, nodesById) && !selectVectorEditingNodeIds(state).includes(hit.id) ? hit : null;
};
