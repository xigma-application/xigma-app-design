// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { applySmartSelectionSuggestion } from '../applySmartSelectionSuggestion/applySmartSelectionSuggestion';
import { getSmartSelectionSuggestionIconAtPoint } from '../../../../../utils/getSmartSelectionSuggestionIconAtPoint';

export const armSmartSelectionSuggestionOnPointerDown = ({
  dispatch,
  point,
  smartSelectionNodes,
  viewport,
}: TArmContext): true | undefined => {
  const nodesById = selectNodes(store.getState());
  const hit = getSmartSelectionSuggestionIconAtPoint(point, smartSelectionNodes, viewport, nodesById);

  if (hit) {
    applySmartSelectionSuggestion(dispatch, hit.suggestion);

    return true;
  }
};
