// types
import { TDesignState } from '../types';

export const handleUpdateTextEditContent = (state: TDesignState, content: string): void => {
  state.editingTextContent = content;
};
