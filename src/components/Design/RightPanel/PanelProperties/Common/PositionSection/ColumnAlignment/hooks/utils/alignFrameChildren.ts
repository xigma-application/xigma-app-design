// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TFrameNode, TNodeAlignment, TSceneNode } from 'types/design/types';

// utils
import { getFrameBoxChildren } from './getFrameBoxChildren';
import { moveNodeToAlignment } from './moveNodeToAlignment';

export const alignFrameChildren = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  frame: TFrameNode | undefined,
  next: TNodeAlignment,
): void => {
  if (frame) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    getFrameBoxChildren(nodes, frame).forEach((child) => moveNodeToAlignment(dispatch, child, frame, { ...child.alignment, ...next }));
    dispatch(endHistoryGesture());
  }
};
