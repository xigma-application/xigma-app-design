// store
import { selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { ungroupNodes } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';

export const handleUngroupSelection = (dispatch: AppDispatch): void => {
  const state = store.getState();

  if (selectVectorEditingNodeIds(state).length === 0) {
    const groupIds = selectSelectedNodes(state)
      .filter((node) => node?.type === NodeType.group)
      .map((node) => node.id);

    if (groupIds.length > 0) {
      dispatch(ungroupNodes(groupIds));
    }
  }
};
