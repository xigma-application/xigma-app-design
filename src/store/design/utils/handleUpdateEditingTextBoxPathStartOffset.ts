// types
import { TDesignState } from '../types';

export const handleUpdateEditingTextBoxPathStartOffset = (state: TDesignState, pathStartOffset: number): void => {
  if (state.editingTextBox) {
    state.editingTextBox.pathStartOffset = pathStartOffset;
  }
};
