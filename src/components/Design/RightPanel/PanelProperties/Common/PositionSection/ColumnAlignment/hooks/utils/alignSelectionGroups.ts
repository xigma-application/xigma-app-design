// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TNodeAlignment, TSceneNode } from 'types/design/types';

// utils
import { collectNudgeSubtreeNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/collectNudgeSubtreeNodes';
import { getAlignmentOffset } from './getAlignmentOffset';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { getSelectionBounds } from 'components/Design/Canvas/utils/getSelectionBounds';
import { translateNodes } from 'components/Design/Canvas/utils/translateNodes';

const alignGroup = (dispatch: AppDispatch, nodes: Record<string, TSceneNode>, group: TSceneNode[], next: TNodeAlignment): void => {
  const target = getSelectionBounds(group);

  group.forEach((node) => {
    const bounds = getRotatedNodeBounds(node);
    const deltaX = getAlignmentOffset(next.horizontal, bounds.x, bounds.width, target.x, target.width);
    const deltaY = getAlignmentOffset(next.vertical, bounds.y, bounds.height, target.y, target.height);

    translateNodes(dispatch, collectNudgeSubtreeNodes([node], nodes), deltaX, deltaY);
  });
};

export const alignSelectionGroups = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  groups: TSceneNode[][],
  next: TNodeAlignment,
): void => {
  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  groups.forEach((group) => alignGroup(dispatch, nodes, group, next));
  dispatch(endHistoryGesture());
};
