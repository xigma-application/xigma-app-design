// types
import { TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const handleToggleNodeLocked = (state: TDesignState, id: string): void => {
  const node = getActivePage(state).nodes[id];

  if (node) {
    node.locked = !node.locked;
  }
};
