// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../AppearanceSection/types';
import { StrokeMode } from 'types/design/enums';

// utils
import { getStrokeModeChange } from 'utils/design/stroke/getStrokeModeChange';

export type TUseStrokeSettingsPanelResult = {
  activeTab: StrokeMode | undefined;
  onTabChange: TFunc<[string]>;
};

export const useStrokeSettingsPanel = (): TUseStrokeSettingsPanelResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter(isAppearanceNode);
  const modes = nodes.map((node) => node.strokeMode ?? StrokeMode.basic);
  const activeTab = modes.every((mode) => mode === modes[0]) ? (modes[0] ?? StrokeMode.basic) : undefined;

  const onTabChange = (tab: string): void => {
    if (nodes.length > 0 && tab !== activeTab) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNodes(nodes.map((node) => ({ changes: getStrokeModeChange(node, tab as StrokeMode), id: node.id }))));
      dispatch(endHistoryGesture());
    }
  };

  return { activeTab, onTabChange };
};
