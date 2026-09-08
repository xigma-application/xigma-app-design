// store
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TGroupLikeNode } from 'types/design/types';

// utils
import { getGroupLikeParentIds } from 'store/design/utils/nodeHierarchy/getGroupLikeParentIds';

export const resyncGroupAutoLayoutAncestors = (dispatch: AppDispatch, nodeOriginIds: string[]): void => {
  const { nodes } = selectActivePage(store.getState());
  const draggedIds = new Set(nodeOriginIds);
  const groupLikeParentIds = getGroupLikeParentIds(nodes, nodeOriginIds);

  groupLikeParentIds.forEach((groupId) => {
    const group = nodes[groupId] as TGroupLikeNode;
    const isRigidGroupMove = group.childIds.every((childId) => draggedIds.has(childId));

    if (!isRigidGroupMove) {
      dispatch(updateNode({ changes: {}, id: groupId }));
    }
  });
};
