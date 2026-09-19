// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../../../AppearanceSection/types';
import { TStrokeDynamicChanges, TUseStrokeSettingsDynamicTabResult } from '../../types';

// utils
import { getStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';
import { handleStrokeDynamicBlur } from './utils/handleStrokeDynamicBlur';

export const useStrokeSettingsDynamicTab = (): TUseStrokeSettingsDynamicTabResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const values = getStrokeDynamicValues(node);

  const commit = (changes: TStrokeDynamicChanges): void => {
    if (node) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNode({ changes, id: node.id }));
      dispatch(endHistoryGesture());
    }
  };

  return {
    onBlur: (field) => (event) => handleStrokeDynamicBlur(event, field, values[field], commit),
    values,
  };
};
