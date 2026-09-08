// store
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateNode } from 'store/design/slice';

// utils
import { getGroupLikeParentIds } from 'store/design/utils/nodeHierarchy/getGroupLikeParentIds';

export const resyncResizedGroupAutoLayoutAncestors = (dispatch: AppDispatch, nodeIds: string[]): void => {
  const { nodes } = selectActivePage(store.getState());
  const groupLikeParentIds = getGroupLikeParentIds(nodes, nodeIds);

  groupLikeParentIds.forEach((groupId) => {
    dispatch(updateNode({ changes: {}, id: groupId }));
  });
};
