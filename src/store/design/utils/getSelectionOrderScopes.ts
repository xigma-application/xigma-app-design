// types
import { TDesignPage } from '../types';

// utils
import { isContainerNode } from './nodeHierarchy/isContainerNode';

export const getSelectionOrderScopes = (page: TDesignPage): string[][] => {
  const parentIds = new Set(page.selectedIds.map((id) => page.nodes[id]?.parentId ?? null));

  return Array.from(parentIds).map((parentId) => {
    const parent = parentId ? page.nodes[parentId] : null;
    return parent && isContainerNode(parent) ? parent.childIds : page.rootOrder;
  });
};
