// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { flipFrameTree } from './flipFrame/flipFrameTree';
import { flipLeafNode } from './flipFrame/flipLeafNode';
import { getGroupLeafNodes } from 'store/design/utils/nodeHierarchy/getGroupLeafNodes';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';
import { isLayoutContainerNode } from 'utils/canvas/signals/isLayoutContainerNode';

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

  if (selectedNodes.length === 1 && selectedNodes[0].type === NodeType.frame) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    flipFrameTree(dispatch, selectedNodes[0].id, axis, null);
    dispatch(endHistoryGesture());
  } else if (selectedNodes.length !== 0) {
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
