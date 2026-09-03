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

export const getSelectionHitAtPoint = (point: TPoint, orderedNodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const state = store.getState();
  const selectedNodes = selectSelectedNodes(state);
  const hit = getNodeAtPoint(point, orderedNodes, viewport);
  const context: TSelectionHitContext = {
    hit,
    nodesById: selectNodes(state),
    point,
    selectedHit: getNodeAtPoint(point, selectedNodes, viewport),
    selectedNodes,
    viewport,
  };

  for (const resolve of SELECTION_HIT_RESOLVERS) {
    const result = resolve(context);

    if (result) {
      return result.node;
    }
  }

  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  return hit && vectorEditingNodeIds.includes(hit.id) ? null : hit;
};
