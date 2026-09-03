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
  const hit = getSmartSelectionSuggestionIconAtPoint(point, smartSelectionNodes, viewport);

  if (hit) {
    applySmartSelectionSuggestion(dispatch, hit.suggestion);

    return true;
  }
};
