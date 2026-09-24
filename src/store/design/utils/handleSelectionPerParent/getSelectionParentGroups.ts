// types
import { TDesignPage } from '../../types';

export const getSelectionParentGroups = (page: TDesignPage): string[][] => {
  const groups = new Map<string | null, string[]>();

  page.selectedIds.forEach((id) => {
    const parentId = page.nodes[id]?.parentId ?? null;

    groups.set(parentId, [...(groups.get(parentId) ?? []), id]);
  });

  return Array.from(groups.values());
};
