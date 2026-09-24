// @xigma
import { TIconProps } from '@xigma/components';

// others
import { DISTRIBUTE_MENU_TRIGGER_ICON, DISTRIBUTE_MIN_CHILDREN, TIDY_UP_ICONS } from '../../constants';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TArrangeAction } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { canAlignFrameChildren } from '../../hooks/utils/canAlignFrameChildren';
import { distributeNodes } from '../../hooks/utils/distributeNodes';
import { getAlignableSelectionGroups } from '../../hooks/utils/getAlignableSelectionGroups';
import { getFrameChildNodes } from '../../hooks/utils/getFrameChildNodes';
import { getTidyUpKind } from '../../hooks/utils/tidyUp/getTidyUpKind';
import { getTidyUpRect } from '../../hooks/utils/tidyUp/getTidyUpRect';
import { isNudgeableNode } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/isNudgeableNode';
import { isTidyableGroup } from '../../hooks/utils/tidyUp/isTidyableGroup';
import { tidyUpNodes } from '../../hooks/utils/tidyUp/tidyUpNodes';

export type TUseDistributeMenuResult = {
  enabledActions: Record<TArrangeAction, boolean>;
  onAction: TFunc<[TArrangeAction]>;
  tidyUpIcon: TIconProps['name'];
  triggerIcon: TIconProps['name'];
};

export const useDistributeMenu = (): TUseDistributeMenuResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes).filter((selected): selected is TSceneNode => selected !== undefined);
  const [selectedNode] = selectedNodes;
  const isMultiSelection = selectedNodes.length > 1;
  const frame = !isMultiSelection && canAlignFrameChildren(selectedNode) ? selectedNode : undefined;
  const frameGroups = frame ? [getFrameChildNodes(nodes, frame).filter((child) => isNudgeableNode(child, nodes))] : [];
  const groups = isMultiSelection ? getAlignableSelectionGroups(selectedNodes, nodes) : frameGroups;
  const distributeGroups = groups.filter((group) => group.length >= DISTRIBUTE_MIN_CHILDREN);
  const tidyUpGroups = isMultiSelection ? groups.filter(isTidyableGroup) : [];
  const [firstTidyUpGroup] = tidyUpGroups;
  const tidyUpKind = firstTidyUpGroup ? getTidyUpKind(firstTidyUpGroup.map(getTidyUpRect)) : undefined;

  const onAction = (action: TArrangeAction): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));

    if (action === 'tidyUp') {
      tidyUpGroups.forEach((group) => tidyUpNodes(dispatch, nodes, group));
    } else {
      distributeGroups.forEach((group) => distributeNodes(dispatch, nodes, group, action));
    }

    dispatch(endHistoryGesture());
  };

  return {
    enabledActions: { horizontal: distributeGroups.length > 0, tidyUp: tidyUpGroups.length > 0, vertical: distributeGroups.length > 0 },
    onAction,
    tidyUpIcon: tidyUpKind ? TIDY_UP_ICONS[tidyUpKind] : TIDY_UP_ICONS.column,
    triggerIcon: tidyUpKind ? TIDY_UP_ICONS[tidyUpKind] : DISTRIBUTE_MENU_TRIGGER_ICON,
  };
};
