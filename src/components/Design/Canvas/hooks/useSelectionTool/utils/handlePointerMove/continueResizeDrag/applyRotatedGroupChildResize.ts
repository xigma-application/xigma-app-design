// store
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getRotatedGroupChildChanges } from './getRotatedGroupChildChanges/getRotatedGroupChildChanges';

export const applyRotatedGroupChildResize = (
  groupId: string,
  groupOrigin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }>,
  childOrigins: Record<string, TResizeNodeOrigin>,
  dispatch: AppDispatch,
): void => {
  if ('width' in groupOrigin) {
    const groupNode = selectActivePage(store.getState()).nodes[groupId];

    if (groupNode && 'width' in groupNode) {
      const newGroupBox = { height: groupNode.height, width: groupNode.width, x: groupNode.x, y: groupNode.y };

      Object.entries(childOrigins).forEach(([childId, childOrigin]) => {
        const changes = getRotatedGroupChildChanges(childOrigin, groupOrigin, groupOrigin.rotation, newGroupBox);

        dispatch(updateNode({ changes, id: childId }));
      });

      dispatch(updateNode({ changes: newGroupBox, id: groupId }));
    }
  }
};
