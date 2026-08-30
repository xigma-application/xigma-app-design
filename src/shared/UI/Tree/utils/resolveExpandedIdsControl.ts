// types
import { TExpandedIdsControl } from '../types';

export const resolveExpandedIdsControl = (
  expandedIds: Set<string> | undefined,
  onExpandedIdsChange: ((next: Set<string>) => void) | undefined,
): TExpandedIdsControl | undefined => {
  if (expandedIds !== undefined && onExpandedIdsChange !== undefined) {
    return { expandedIds, onExpandedIdsChange };
  }

  return undefined;
};
