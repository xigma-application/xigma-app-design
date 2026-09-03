// types
import { TArmContext } from '../types';

// utils
import { applySmartSelectionSuggestion } from '../applySmartSelectionSuggestion';
import { getSmartSelectionSuggestionIconAtPoint } from '../../../../../utils/getSmartSelectionSuggestionIconAtPoint';

export const armSmartSelectionSuggestionOnPointerDown = ({ dispatch, point, selectedNodes, viewport }: TArmContext): true | undefined => {
  const hit = getSmartSelectionSuggestionIconAtPoint(point, selectedNodes, viewport);

  if (hit) {
    applySmartSelectionSuggestion(dispatch, hit.suggestion);

    return true;
  }
};
