// types
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleDeleteNode } from './handleDeleteNode/handleDeleteNode';
import { getActivePage } from './getActivePage';
import { isContainerNode } from './nodeHierarchy/isContainerNode';

export const handleReplaceNode = (state: TDesignState, payload: { id: string; node: TSceneNode }): void => {
  const page = getActivePage(state);
  const previousNode = page.nodes[payload.id];

  if (previousNode) {
    page.nodes[payload.id] = payload.node;

    if (isContainerNode(previousNode)) {
      const keptChildIds = new Set(isContainerNode(payload.node) ? payload.node.childIds : []);

      previousNode.childIds.filter((childId) => !keptChildIds.has(childId)).forEach((childId) => handleDeleteNode(state, childId));
    }
  }
};
