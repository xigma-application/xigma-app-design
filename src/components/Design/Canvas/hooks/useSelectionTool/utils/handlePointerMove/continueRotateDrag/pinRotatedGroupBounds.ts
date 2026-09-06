// store
import { updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRotateNodeOrigin } from 'types/design/selectionTool/types';

export const pinRotatedGroupBounds = (dispatch: AppDispatch, nodeOrigins: Record<string, TRotateNodeOrigin>): void => {
  const { nodes } = selectActivePage(store.getState());

  Object.entries(nodeOrigins).forEach(([id, origin]) => {
    if (nodes[id]?.type === NodeType.group && 'width' in origin) {
      dispatch(updateNode({ changes: { height: origin.height, width: origin.width }, id }));
    }
  });
};
