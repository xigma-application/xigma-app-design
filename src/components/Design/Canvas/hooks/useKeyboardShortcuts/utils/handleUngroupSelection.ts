// store
import { selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { ungroupNodes } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// utils
import { isGroupLikeNode } from 'store/design/utils/nodeHierarchy/isGroupLikeNode';

export const handleUngroupSelection = (dispatch: AppDispatch): void => {
  const state = store.getState();

  if (selectVectorEditingNodeIds(state).length === 0) {
    const groupIds = selectSelectedNodes(state)
      .filter((node) => node && isGroupLikeNode(node))
      .map((node) => node.id);

    if (groupIds.length > 0) {
      dispatch(ungroupNodes(groupIds));
    }
  }
};
