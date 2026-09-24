// types
import { TFlattenEntry } from './types';

export const getFlattenEntryGroups = (entries: TFlattenEntry[]): TFlattenEntry[][] => {
  const groups = new Map<string | null, TFlattenEntry[]>();

  entries.forEach((entry) => {
    groups.set(entry.node.parentId, [...(groups.get(entry.node.parentId) ?? []), entry]);
  });

  return Array.from(groups.values());
};
