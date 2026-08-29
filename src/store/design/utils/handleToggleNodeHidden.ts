// types
import { TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const handleToggleNodeHidden = (state: TDesignState, id: string): void => {
  const node = getActivePage(state).nodes[id];

  if (node) {
    node.hidden = !node.hidden;
  }
};
