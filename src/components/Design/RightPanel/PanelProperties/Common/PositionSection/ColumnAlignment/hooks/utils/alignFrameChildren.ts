// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TFrameNode, TNodeAlignment, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { alignNodeToRect } from './alignNodeToRect';
import { commitAlignmentConstraint } from './commitAlignmentConstraint';
import { getFrameChildNodes } from './getFrameChildNodes';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

const alignChild = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  frame: TFrameNode | TSectionNode,
  child: TSceneNode,
  next: TNodeAlignment,
): void => {
  alignNodeToRect(dispatch, nodes, child, getRotatedNodeBounds(frame), next);

  if (isBoxSceneNode(child)) {
    commitAlignmentConstraint(dispatch, child, { ...child.alignment, ...next });
  }
};

export const alignFrameChildren = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  frame: TFrameNode | TSectionNode | undefined,
  next: TNodeAlignment,
): void => {
  if (frame) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    getFrameChildNodes(nodes, frame).forEach((child) => alignChild(dispatch, nodes, frame, child, next));
    dispatch(endHistoryGesture());
  }
};
