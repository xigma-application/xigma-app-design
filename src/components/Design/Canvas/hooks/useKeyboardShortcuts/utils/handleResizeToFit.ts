// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { updateNode } from 'store/design/slice';
import { selectCanResizeToFit, selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';
import { getRotatedGroupBounds } from 'store/design/utils/getRotatedGroupBounds';

const resizeNodeToFit = (dispatch: AppDispatch, nodes: Record<string, TSceneNode>, selectedNode: TSceneNode | undefined): void => {
  if (selectedNode?.type === NodeType.frame || selectedNode?.type === NodeType.section) {
    const children = selectedNode.childIds.map((childId) => nodes[childId]).filter(Boolean);

    if (children.length > 0) {
      const bounds = selectedNode.rotation === 0 ? getNodesBoundingBox(children) : getRotatedGroupBounds(children, selectedNode.rotation);
      dispatch(updateNode({ changes: { height: bounds.height, width: bounds.width, x: bounds.x, y: bounds.y }, id: selectedNode.id }));
    }
  }
};

export const handleResizeToFit = (dispatch: AppDispatch): void => {
  const state = store.getState();

  if (selectCanResizeToFit(state)) {
    const nodes = selectNodes(state);

    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    selectSelectedNodes(state).forEach((selectedNode) => resizeNodeToFit(dispatch, nodes, selectedNode));
    dispatch(endHistoryGesture());
  }
};
