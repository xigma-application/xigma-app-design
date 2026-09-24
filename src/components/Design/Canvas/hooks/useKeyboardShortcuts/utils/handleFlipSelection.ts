// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, RootState, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TFlipAxis } from './flipFrame/types';
import { TSceneNode } from 'types/design/types';

// utils
import { flipFrameTree } from './flipFrame/flipFrameTree';
import { flipLeafNode } from './flipFrame/flipLeafNode';
import { getGroupLeafNodes } from 'store/design/utils/nodeHierarchy/getGroupLeafNodes';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';

const getSelectedNodes = (state: RootState, nodes: Record<string, TSceneNode>): TSceneNode[] =>
  selectSelectedIds(state)
    .map((id) => nodes[id])
    .filter(Boolean);

const flipLeaf = (dispatch: AppDispatch, leafId: string, anchors: TPoint, axis: TFlipAxis, isSingleBoxOrigin: boolean): void => {
  const leaf = selectNodes(store.getState())[leafId];

  switch (leaf.type) {
    case NodeType.frame:
      flipFrameTree(dispatch, leaf.id, axis, anchors);
      break;
    case NodeType.section:
      break;
    default:
      flipLeafNode(dispatch, leaf, anchors, axis === 'horizontal' ? -1 : 1, axis === 'vertical' ? -1 : 1, isSingleBoxOrigin);
  }
};

export const handleFlipSelection = (dispatch: AppDispatch, axis: TFlipAxis): void => {
  const state = store.getState();
  const nodes = selectNodes(state);
  const selectedNodes = getSelectedNodes(state, nodes);
  const leaves = selectedNodes.flatMap((node) => getGroupLeafNodes(node, nodes));

  if (leaves.some((leaf) => leaf.type !== NodeType.section)) {
    const bounds = getNodesBoundingBox(selectedNodes);
    const anchors = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const isSingleBoxOrigin = selectedNodes.length === 1 && selectedNodes[0].type !== NodeType.group;

    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    leaves.forEach((leaf) => flipLeaf(dispatch, leaf.id, anchors, axis, isSingleBoxOrigin));
    dispatch(endHistoryGesture());
  }
};
