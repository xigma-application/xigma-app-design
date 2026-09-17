// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { clearResizeOriginalFills } from '../../useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeOriginalFillsCache';
import { getGroupLeafNodes } from 'store/design/utils/nodeHierarchy/getGroupLeafNodes';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';
import { getResizeNodeOrigin } from '../../useSelectionTool/utils/handlePointerDown/armResizeDrag/getResizeNodeOrigin';
import { isLayoutContainerNode } from 'utils/canvas/signals/isLayoutContainerNode';
import { resizeNode } from '../../useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeNode';

const normalizeFlippedLeafRotation = (dispatch: AppDispatch, leaf: TSceneNode): void => {
  if (leaf.type !== NodeType.line && leaf.rotation !== 0) {
    dispatch(updateNode({ changes: { rotation: (360 - (leaf.rotation % 360)) % 360 }, id: leaf.id }));
  }
};

const flipLeafNode = (
  dispatch: AppDispatch,
  leaf: TSceneNode,
  anchors: TPoint,
  scaleX: number,
  scaleY: number,
  isSingleBoxOrigin: boolean,
): void => {
  const origin = getResizeNodeOrigin(leaf);

  clearResizeOriginalFills(leaf.id);
  resizeNode(leaf.id, origin, dispatch, anchors, scaleX, scaleY, isSingleBoxOrigin, null);
  clearResizeOriginalFills(leaf.id);
  normalizeFlippedLeafRotation(dispatch, leaf);
};

const flipLeaves = (
  dispatch: AppDispatch,
  leaves: TSceneNode[],
  anchors: TPoint,
  scaleX: number,
  scaleY: number,
  isSingleBoxOrigin: boolean,
): void => {
  leaves.forEach((leaf) => flipLeafNode(dispatch, leaf, anchors, scaleX, scaleY, isSingleBoxOrigin));
};

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
    const leaves = selectedNodes.flatMap((node) => getGroupLeafNodes(node, nodes)).filter((leaf) => !isLayoutContainerNode(leaf));

    if (leaves.length !== 0) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      flipLeaves(dispatch, leaves, anchors, scaleX, scaleY, isSingleBoxOrigin);
      dispatch(endHistoryGesture());
    }
  }
};
