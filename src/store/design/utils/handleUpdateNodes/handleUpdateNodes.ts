// types
import { TDesignState, TUpdateNodesPayload } from '../../types';

// utils
import { handleUpdateNode } from '../handleUpdateNode/handleUpdateNode';

export const handleUpdateNodes = (state: TDesignState, updates: TUpdateNodesPayload): void => {
  updates.forEach((update) => handleUpdateNode(state, update));
};
