// types
import { TDesignPage } from '../types';

// utils
import { isContainerNode } from './nodeHierarchy/isContainerNode';

export const removeNodesFromContainer = (page: TDesignPage, containerParentId: string | null, nodeIds: string[]): void => {
  const nodeIdSet = new Set(nodeIds);

  if (containerParentId) {
    const parent = page.nodes[containerParentId];

    if (parent && isContainerNode(parent)) {
      parent.childIds = parent.childIds.filter((id) => !nodeIdSet.has(id));
    }
  } else {
    page.rootOrder = page.rootOrder.filter((id) => !nodeIdSet.has(id));
  }
};
