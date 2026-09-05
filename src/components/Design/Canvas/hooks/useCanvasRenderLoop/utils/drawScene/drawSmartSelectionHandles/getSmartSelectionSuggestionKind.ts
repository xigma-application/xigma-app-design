// types
import { TSmartSelectionSuggestion } from 'types/design/smartSelection/types';

export const getSmartSelectionSuggestionKind = (suggestion: TSmartSelectionSuggestion): 'column' | 'grid' | 'row' => {
  switch (suggestion.type) {
    case 'grid-equalize':
    case 'grid-append':
      return 'grid';
    default:
      return suggestion.axis === 'x' ? 'row' : 'column';
  }
};
