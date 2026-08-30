// types
import { TDesignState } from '../types';

// utils
import { cascadeSetGroupChildrenFlag } from './cascadeSetGroupChildrenFlag';
import { getActivePage } from './getActivePage';

export const handleToggleNodeLocked = (state: TDesignState, id: string): void => {
  const node = getActivePage(state).nodes[id];

  if (node) {
    node.locked = !node.locked;
    cascadeSetGroupChildrenFlag(state, node, 'locked', node.locked);
  }
};
