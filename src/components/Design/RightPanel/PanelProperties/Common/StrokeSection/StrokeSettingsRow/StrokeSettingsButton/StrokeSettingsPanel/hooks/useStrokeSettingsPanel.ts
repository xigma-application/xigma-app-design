// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../AppearanceSection/types';
import { StrokeMode } from 'types/design/enums';

// utils
import { getStrokeModeChange } from 'utils/design/stroke/getStrokeModeChange';

export type TUseStrokeSettingsPanelResult = {
  activeTab: StrokeMode;
  onTabChange: TFunc<[string]>;
};

export const useStrokeSettingsPanel = (): TUseStrokeSettingsPanelResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const activeTab = node?.strokeMode ?? StrokeMode.basic;

  const onTabChange = (tab: string): void => {
    if (node && tab !== activeTab) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNode({ changes: getStrokeModeChange(node, tab as StrokeMode), id: node.id }));
      dispatch(endHistoryGesture());
    }
  };

  return { activeTab, onTabChange };
};
