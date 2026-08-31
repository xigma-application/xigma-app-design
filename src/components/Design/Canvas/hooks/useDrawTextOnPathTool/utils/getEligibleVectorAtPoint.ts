// store
import { selectOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../utils/getNodeAtPoint/getNodeAtPoint';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';

export const getEligibleVectorAtPoint = (point: TPoint, viewport: TViewport): TSceneNode | null => {
  const state = store.getState();
  const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);

  if (hit?.type === NodeType.vector) {
    return getVectorChainOrder(hit) !== null ? hit : null;
  }

  return hit && isConvertibleToVectorNode(hit) ? hit : null;
};
