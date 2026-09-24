// store
import { AppDispatch, store } from 'store';
import { selectNodes } from 'store/design/selectors';

// utils
import { clearResizeOriginalFills } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeOriginalFillsCache';
import { getResizeNodeOrigin } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerDown/armResizeDrag/getResizeNodeOrigin';
import { getTransformTargetNodes } from 'store/design/utils/nodeHierarchy/getTransformTargetNodes';
import { isGroupLikeNode } from 'store/design/utils/nodeHierarchy/isGroupLikeNode';
import { resizeNode } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeNode';

export const scaleGroupLikeNode = (dispatch: AppDispatch, id: string, dimensionChanges: { height: number; width: number }): void => {
  const nodes = selectNodes(store.getState());
  const group = nodes[id];

  if (group && isGroupLikeNode(group)) {
    const scaleX = group.width > 0 ? dimensionChanges.width / group.width : 1;
    const scaleY = group.height > 0 ? dimensionChanges.height / group.height : 1;

    getTransformTargetNodes([group], nodes).forEach((leaf) => {
      resizeNode(leaf.id, getResizeNodeOrigin(leaf), dispatch, { x: group.x, y: group.y }, scaleX, scaleY, false, null);
      clearResizeOriginalFills(leaf.id);
    });
  }
};
