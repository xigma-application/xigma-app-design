// types
import { TDesignState, TStartTextEditPayload } from '../types';

export const handleStartTextEdit = (state: TDesignState, payload: TStartTextEditPayload): void => {
  state.editingTextBox = payload.box;
  state.editingTextContent = payload.content ?? '';
  state.editingNodeId = payload.id ?? null;
};
