// store
import { AppDispatch } from 'store';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { collectNudgeSubtreeNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/collectNudgeSubtreeNodes';
import { translateNodes } from 'components/Design/Canvas/utils/translateNodes';

export const translateNodeSubtree = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  node: TSceneNode,
  deltaX: number,
  deltaY: number,
): void => translateNodes(dispatch, collectNudgeSubtreeNodes([node], nodes), deltaX, deltaY);
