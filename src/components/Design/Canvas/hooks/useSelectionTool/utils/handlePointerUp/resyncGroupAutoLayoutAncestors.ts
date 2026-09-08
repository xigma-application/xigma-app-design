// store
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TGroupLikeNode } from 'types/design/types';

// utils
import { isGroupLikeNode } from 'store/design/utils/nodeHierarchy/isGroupLikeNode';

export const resyncGroupAutoLayoutAncestors = (dispatch: AppDispatch, nodeOriginIds: string[]): void => {
  const { nodes } = selectActivePage(store.getState());
  const draggedIds = new Set(nodeOriginIds);
  const groupLikeParentIds = new Set<string>();

  draggedIds.forEach((id) => {
    const parentId = nodes[id]?.parentId;
    const parent = parentId ? nodes[parentId] : null;

    if (parentId && !draggedIds.has(parentId) && parent && isGroupLikeNode(parent)) {
      groupLikeParentIds.add(parentId);
    }
  });

  groupLikeParentIds.forEach((groupId) => {
    const group = nodes[groupId] as TGroupLikeNode;
    const isRigidGroupMove = group.childIds.every((childId) => draggedIds.has(childId));

    if (!isRigidGroupMove) {
      dispatch(updateNode({ changes: {}, id: groupId }));
    }
  });
};
