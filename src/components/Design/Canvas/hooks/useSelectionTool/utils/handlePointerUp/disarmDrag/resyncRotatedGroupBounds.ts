// store
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TDragState } from 'types/design/selectionTool/types';
import { TGroupLikeNode } from 'types/design/types';

// utils
import { getRotatedGroupBounds } from 'store/design/utils/getRotatedGroupBounds';
import { isGroupLikeNode } from 'store/design/utils/nodeHierarchy/isGroupLikeNode';

export const resyncRotatedGroupBounds = (dispatch: AppDispatch, dragState: TDragState): void => {
  const { nodes } = selectActivePage(store.getState());
  const draggedIds = new Set(Object.keys(dragState.nodeOrigins));
  const brokenGroupIds = new Set<string>();

  draggedIds.forEach((id) => {
    const parentId = nodes[id]?.parentId;
    const parent = parentId ? nodes[parentId] : null;

    if (parentId && !draggedIds.has(parentId) && parent && isGroupLikeNode(parent) && parent.rotation !== 0) {
      brokenGroupIds.add(parentId);
    }
  });

  brokenGroupIds.forEach((groupId) => {
    const group = nodes[groupId] as TGroupLikeNode;
    const children = group.childIds.map((childId) => nodes[childId]).filter(Boolean);

    if (children.length > 0) {
      dispatch(updateNode({ changes: getRotatedGroupBounds(children, group.rotation), id: groupId }));
    }
  });
};
