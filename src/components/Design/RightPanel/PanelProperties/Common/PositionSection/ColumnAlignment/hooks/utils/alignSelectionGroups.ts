// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TNodeAlignment, TSceneNode } from 'types/design/types';

// utils
import { alignNodeToRect } from './alignNodeToRect';
import { getSelectionBounds } from 'components/Design/Canvas/utils/getSelectionBounds';

const alignGroup = (dispatch: AppDispatch, nodes: Record<string, TSceneNode>, group: TSceneNode[], next: TNodeAlignment): void => {
  const target = getSelectionBounds(group);

  group.forEach((node) => alignNodeToRect(dispatch, nodes, node, target, next));
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
