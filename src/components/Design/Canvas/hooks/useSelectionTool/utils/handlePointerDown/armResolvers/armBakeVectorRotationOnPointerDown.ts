// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { TVectorNode } from 'types/design/types';

// utils
import { getBakedVectorRotationChanges } from 'utils/canvas/vectorNetwork/getBakedVectorRotationChanges';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const armBakeVectorRotationOnPointerDown = ({ dispatch }: TArmContext): undefined => {
  const state = store.getState();

  selectVectorEditingNodeIds(state)
    .map((id) => getVectorEditingNode(state.design.pages[state.design.activePageId].nodes, id))
    .filter((node): node is TVectorNode => Boolean(node?.rotation))
    .forEach((node) => {
      dispatch(updateNode({ changes: getBakedVectorRotationChanges(node), id: node.id }));
    });

  return undefined;
};
