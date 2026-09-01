// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getGroupLeafNodes } from 'store/design/utils/nodeHierarchy/getGroupLeafNodes';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';
import { getResizeNodeOrigin } from '../../useSelectionTool/utils/handlePointerDown/armResizeDrag/getResizeNodeOrigin';
import { resizeNode } from '../../useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeNode';

export const handleFlipSelection = (dispatch: AppDispatch, axis: 'horizontal' | 'vertical'): void => {
  const state = store.getState();
  const nodes = selectNodes(state);
  const selectedNodes = selectSelectedIds(state)
    .map((id) => nodes[id])
    .filter(Boolean);

  if (selectedNodes.length !== 0) {
    const bounds = getNodesBoundingBox(selectedNodes);
    const anchors = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const scaleX = axis === 'horizontal' ? -1 : 1;
    const scaleY = axis === 'vertical' ? -1 : 1;
    const isSingleBoxOrigin = selectedNodes.length === 1 && selectedNodes[0].type !== NodeType.group;
    const leaves = selectedNodes.flatMap((node) => getGroupLeafNodes(node, nodes));

    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    leaves.forEach((leaf) => {
      const origin = getResizeNodeOrigin(leaf);

      resizeNode(leaf.id, origin, dispatch, anchors, scaleX, scaleY, isSingleBoxOrigin, null);
    });
    dispatch(endHistoryGesture());
  }
};
