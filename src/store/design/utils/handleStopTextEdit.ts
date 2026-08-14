// types
import { TDesignState } from '../types';

export const handleStopTextEdit = (state: TDesignState): void => {
  state.editingTextBox = null;
  state.editingTextContent = '';
  state.editingNodeId = null;
  state.editingSelectionStart = 0;
  state.editingSelectionEnd = 0;
  state.editingSelectionChangedAt = 0;
};
