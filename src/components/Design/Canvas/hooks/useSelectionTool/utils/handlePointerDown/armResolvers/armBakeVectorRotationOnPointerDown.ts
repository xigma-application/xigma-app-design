// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const armBakeVectorRotationOnPointerDown = ({ dispatch }: TArmContext): undefined => {
  const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

  if (node && node.rotation) {
    dispatch(updateNode({ changes: bakeVectorNodeRotation(node), id: node.id }));
  }

  return undefined;
};
