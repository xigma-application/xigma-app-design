// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectAppearanceNodes } from 'store/design/selectors';
import { updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { StrokeMode } from 'types/design/enums';

// utils
import { isStyledOrVectorNode } from '../../../../../AppearanceSection/utils/isStyledOrVectorNode';
import { getStrokeModeChange } from 'utils/design/stroke/getStrokeModeChange';

export type TUseStrokeSettingsPanelResult = {
  activeTab: StrokeMode | undefined;
  onTabChange: TFunc<[string]>;
};

export const useStrokeSettingsPanel = (): TUseStrokeSettingsPanelResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isStyledOrVectorNode);
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
