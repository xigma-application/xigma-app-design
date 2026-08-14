// types
import { TDesignState, TTextEditSelection } from '../types';

export const handleUpdateTextEditSelection = (state: TDesignState, selection: TTextEditSelection): void => {
  state.editingSelectionStart = selection.start;
  state.editingSelectionEnd = selection.end;
  state.editingSelectionChangedAt = Date.now();
};
