// types
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { isContainerNode } from './nodeHierarchy/isContainerNode';

export const cascadeSetGroupChildrenFlag = (state: TDesignState, node: TSceneNode, flag: 'hidden' | 'locked', value: boolean): void => {
  if (isContainerNode(node)) {
    const { nodes } = getActivePage(state);

    node.childIds.forEach((childId) => {
      const child = nodes[childId];

      if (child) {
        child[flag] = value;
        cascadeSetGroupChildrenFlag(state, child, flag, value);
      }
    });
  }
};
