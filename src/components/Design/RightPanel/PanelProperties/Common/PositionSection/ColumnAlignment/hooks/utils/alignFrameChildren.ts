// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TBoxSceneNode, TFrameNode, TNodeAlignment, TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { moveNodeToAlignment } from './moveNodeToAlignment';

const isExistingBoxSceneNode = (node: TSceneNode | undefined): node is TBoxSceneNode => node !== undefined && isBoxSceneNode(node);

export const alignFrameChildren = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  frame: TFrameNode | undefined,
  next: TNodeAlignment,
): void => {
  if (frame) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    frame.childIds
      .map((id) => nodes[id])
      .filter(isExistingBoxSceneNode)
      .forEach((child) => moveNodeToAlignment(dispatch, child, frame, { ...child.alignment, ...next }));
    dispatch(endHistoryGesture());
  }
};
