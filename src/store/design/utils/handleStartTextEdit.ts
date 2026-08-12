// types
import { TDesignState } from '../types';
import { TEditingTextBox } from 'types/canvas';

export const handleStartTextEdit = (state: TDesignState, box: TEditingTextBox): void => {
  state.editingTextBox = box;
  state.editingTextContent = '';
};
