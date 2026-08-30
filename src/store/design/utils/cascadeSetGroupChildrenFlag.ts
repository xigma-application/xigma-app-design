// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';

export const cascadeSetGroupChildrenFlag = (state: TDesignState, node: TSceneNode, flag: 'hidden' | 'locked', value: boolean): void => {
  if (node.type === NodeType.group) {
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
