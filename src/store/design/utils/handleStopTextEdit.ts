// types
import { TDesignState } from '../types';

export const handleStopTextEdit = (state: TDesignState): void => {
  state.editingTextBox = null;
  state.editingTextContent = '';
  state.editingNodeId = null;
};
