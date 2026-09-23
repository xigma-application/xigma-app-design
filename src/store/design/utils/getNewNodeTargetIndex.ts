// types
import { TDesignPage } from '../types';

// utils
import { isContainerNode } from './nodeHierarchy/isContainerNode';

export const getNewNodeTargetIndex = (page: TDesignPage, parentId: string | null): number => {
  const parent = parentId ? page.nodes[parentId] : null;
  return parent && isContainerNode(parent) ? parent.childIds.length : page.rootOrder.length;
};
