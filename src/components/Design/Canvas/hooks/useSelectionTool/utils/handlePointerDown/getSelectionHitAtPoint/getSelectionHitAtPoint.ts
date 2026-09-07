// store
import { selectNodes, selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// others
import { SELECTION_HIT_RESOLVERS } from './constants';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TSelectionHitContext } from './types';

// utils
import { getNodeAtPoint } from '../../../../../utils/getNodeAtPoint/getNodeAtPoint';
import { isPointClippedFromNode } from '../../../../../utils/getNodeAtPoint/isPointClippedFromNode';

export const getSelectionHitAtPoint = (point: TPoint, orderedNodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const state = store.getState();
  const nodesById = selectNodes(state);
  const selectedNodes = selectSelectedNodes(state);
  const selectedIds = new Set(selectedNodes.map((node) => node.id));
  const hit = getNodeAtPoint(point, orderedNodes, viewport);
  const context: TSelectionHitContext = {
    hit,
    nodesById,
    point,
    selectedHit: getNodeAtPoint(point, selectedNodes, viewport, { ignoreClip: true }),
    selectedNodes,
    viewport,
  };
  const pickable = (node: TSceneNode | null): TSceneNode | null =>
    node && !selectedIds.has(node.id) && isPointClippedFromNode(point, node, nodesById) ? null : node;

  for (const resolve of SELECTION_HIT_RESOLVERS) {
    const result = resolve(context);

    if (result) {
      return pickable(result.node);
    }
  }

  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  return pickable(hit && vectorEditingNodeIds.includes(hit.id) ? null : hit);
};
