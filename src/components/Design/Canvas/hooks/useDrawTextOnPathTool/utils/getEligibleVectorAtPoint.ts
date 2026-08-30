// store
import { selectOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TViewport, TVectorNode } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../utils/getNodeAtPoint/getNodeAtPoint';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder';

export const getEligibleVectorAtPoint = (point: TPoint, viewport: TViewport): TVectorNode | null => {
  const state = store.getState();
  const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);

  return hit?.type === NodeType.vector && getVectorChainOrder(hit) !== null ? hit : null;
};
