// types
import { TDesignState, TStartTextEditPayload } from '../types';

export const handleStartTextEdit = (state: TDesignState, payload: TStartTextEditPayload): void => {
  const content = payload.content ?? '';

  state.editingTextBox = payload.box;
  state.editingTextContent = content;
  state.editingNodeId = payload.id ?? null;
  state.editingSelectionStart = 0;
  state.editingSelectionEnd = payload.id ? content.length : 0;
  state.editingSelectionChangedAt = Date.now();
};
