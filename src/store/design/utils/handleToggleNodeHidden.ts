// types
import { TDesignState } from '../types';

// utils
import { cascadeSetGroupChildrenFlag } from './cascadeSetGroupChildrenFlag';
import { getActivePage } from './getActivePage';

export const handleToggleNodeHidden = (state: TDesignState, id: string): void => {
  const node = getActivePage(state).nodes[id];

  if (node) {
    node.hidden = !node.hidden;
    cascadeSetGroupChildrenFlag(state, node, 'hidden', node.hidden);
  }
};
