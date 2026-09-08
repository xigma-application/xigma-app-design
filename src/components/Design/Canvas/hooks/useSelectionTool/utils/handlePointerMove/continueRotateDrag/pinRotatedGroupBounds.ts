// store
import { updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TRotateNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { isGroupLikeNode } from 'store/design/utils/nodeHierarchy/isGroupLikeNode';

export const pinRotatedGroupBounds = (dispatch: AppDispatch, nodeOrigins: Record<string, TRotateNodeOrigin>): void => {
  const { nodes } = selectActivePage(store.getState());

  Object.entries(nodeOrigins).forEach(([id, origin]) => {
    const node = nodes[id];

    if (node && isGroupLikeNode(node) && 'width' in origin) {
      dispatch(updateNode({ changes: { height: origin.height, width: origin.width }, id }));
    }
  });
};
