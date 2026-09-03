// store
import { AppDispatch } from 'store';

// types
import { TSmartSelectionSuggestion } from 'types/design/smartSelection/types';

// utils
import { applyAppendSuggestion } from './applyAppendSuggestion';
import { applyEqualizeSuggestion } from './applyEqualizeSuggestion';
import { applyGridAppendSuggestion } from './applyGridAppendSuggestion';
import { applyGridEqualizeSuggestion } from './applyGridEqualizeSuggestion';

export const applySmartSelectionSuggestion = (dispatch: AppDispatch, suggestion: TSmartSelectionSuggestion): void => {
  switch (suggestion.type) {
    case 'equalize':
      applyEqualizeSuggestion(dispatch, suggestion);
      break;
    case 'append':
      applyAppendSuggestion(dispatch, suggestion);
      break;
    case 'grid-equalize':
      applyGridEqualizeSuggestion(dispatch, suggestion);
      break;
    default:
      applyGridAppendSuggestion(dispatch, suggestion);
  }
};
