// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { removeNodeMask, ungroupNodes } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const removeMaskShapes = (dispatch: AppDispatch, nodes: TSceneNode[]): void => {
  nodes.forEach((node) => {
    if (node.type !== NodeType.mask) {
      dispatch(removeNodeMask(node.id));
    }
  });
};

export const handleRemoveNodesMask = (dispatch: AppDispatch, nodes: TSceneNode[]): void => {
  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  removeMaskShapes(dispatch, nodes);
  dispatch(ungroupNodes(nodes.filter((node) => node.type === NodeType.mask).map((node) => node.id)));
  dispatch(endHistoryGesture());
};
