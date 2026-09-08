// store
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { isGroupLikeNode } from 'store/design/utils/nodeHierarchy/isGroupLikeNode';

export const resyncSmartSelectionGapAutoLayout = (dispatch: AppDispatch, dragState: TSmartSelectionGapDragState): void => {
  const { nodes } = selectActivePage(store.getState());
  const draggedIds = new Set(Object.keys(dragState.nodeOrigins));
  const groupLikeParentIds = new Set<string>();

  draggedIds.forEach((id) => {
    const parentId = nodes[id]?.parentId;
    const parent = parentId ? nodes[parentId] : null;

    if (parentId && !draggedIds.has(parentId) && parent && isGroupLikeNode(parent)) {
      groupLikeParentIds.add(parentId);
    }
  });

  groupLikeParentIds.forEach((groupId) => {
    dispatch(updateNode({ changes: {}, id: groupId }));
  });
};
