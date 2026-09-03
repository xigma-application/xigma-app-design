// store
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSmartSelectionEqualizeSuggestion } from 'types/design/smartSelection/types';

// utils
import { applySmartSelectionGapCascade } from '../../../../../utils/applySmartSelectionGapCascade';
import { getDragNodeOrigins } from '../armDrag/getDragNodeOrigins';
import { getSmartSelectionCascadeGroups } from '../../../../../utils/getSmartSelectionCascadeGroups';

export const applyEqualizeSuggestion = (dispatch: AppDispatch, suggestion: TSmartSelectionEqualizeSuggestion): void => {
  const cascade = getSmartSelectionCascadeGroups(suggestion.layout, suggestion.axis);
  const movingIds = cascade.cascadeGroups.flatMap((group) => group.nodeIds);
  const nodeOrigins = getDragNodeOrigins(movingIds, selectNodes(store.getState()));
  const meanGap = suggestion.gapValues.reduce((sum, value) => sum + value, 0) / suggestion.gapValues.length;

  applySmartSelectionGapCascade(dispatch, cascade, suggestion.axis, nodeOrigins, meanGap);
};
