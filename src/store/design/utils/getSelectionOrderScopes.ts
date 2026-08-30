// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../types';

export const getSelectionOrderScopes = (page: TDesignPage): string[][] => {
  const parentIds = new Set(page.selectedIds.map((id) => page.nodes[id]?.parentId ?? null));

  return Array.from(parentIds).map((parentId) => {
    const parent = parentId ? page.nodes[parentId] : null;

    return parent && parent.type === NodeType.group ? parent.childIds : page.rootOrder;
  });
};
