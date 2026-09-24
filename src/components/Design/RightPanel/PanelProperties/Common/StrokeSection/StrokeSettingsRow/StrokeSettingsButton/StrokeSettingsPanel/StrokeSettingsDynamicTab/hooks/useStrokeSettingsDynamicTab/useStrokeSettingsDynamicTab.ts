// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectAppearanceNodes } from 'store/design/selectors';
import { updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// others
import { STROKE_DYNAMIC_FIELDS } from '../../constants';

// types
import { isAppearanceNode } from '../../../../../../../AppearanceSection/types';
import { TStrokeDynamicChanges, TUseStrokeSettingsDynamicTabResult } from '../../types';

// utils
import { getStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';
import { handleStrokeDynamicBlur } from './utils/handleStrokeDynamicBlur';

export const useStrokeSettingsDynamicTab = (): TUseStrokeSettingsDynamicTabResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isAppearanceNode);
  const valuesList = nodes.length > 0 ? nodes.map(getStrokeDynamicValues) : [getStrokeDynamicValues(undefined)];
  const values = Object.fromEntries(
    STROKE_DYNAMIC_FIELDS.map((field) => [
      field,
      valuesList.every((nodeValues) => nodeValues[field] === valuesList[0][field]) ? valuesList[0][field] : undefined,
    ]),
  ) as TUseStrokeSettingsDynamicTabResult['values'];

  const commit = (changes: TStrokeDynamicChanges): void => {
    if (nodes.length > 0) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNodes(nodes.map((node) => ({ changes, id: node.id }))));
      dispatch(endHistoryGesture());
    }
  };

  return {
    onBlur: (field) => (event) => handleStrokeDynamicBlur(event, field, values[field], commit),
    values,
  };
};
