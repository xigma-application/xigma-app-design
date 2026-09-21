// types
import { TSelectionColorEntry } from './getSelectionColorOccurrenceEntries';
import { TSelectionColorGroup, TSelectionColorOccurrence } from '../types';

// utils
import { getSelectionColorGroupKey } from './getSelectionColorGroupKey';
import { getSelectionColorOccurrenceIdentity } from './getSelectionColorOccurrenceIdentity';
import { getSelectionColorSignature } from './getSelectionColorSignature';

export const groupSelectionColorEntries = (
  entries: TSelectionColorEntry[],
  pinnedOccurrences: TSelectionColorOccurrence[] | null = null,
): TSelectionColorGroup[] => {
  const pinnedIdentities = new Set((pinnedOccurrences ?? []).map(getSelectionColorOccurrenceIdentity));
  const groups: TSelectionColorGroup[] = [];
  const groupIndexBySignature = new Map<string, number>();
  let pinnedGroupIndex: number | undefined;

  entries.forEach(({ occurrence, paint }) => {
    if (pinnedIdentities.has(getSelectionColorOccurrenceIdentity(occurrence))) {
      if (pinnedGroupIndex === undefined) {
        pinnedGroupIndex = groups.length;
        groups.push({ key: '', occurrences: [occurrence], paint, signature: getSelectionColorSignature(paint) });
      } else {
        groups[pinnedGroupIndex].occurrences.push(occurrence);
      }
    } else {
      const signature = getSelectionColorSignature(paint);
      const groupIndex = groupIndexBySignature.get(signature);

      if (groupIndex === undefined) {
        groupIndexBySignature.set(signature, groups.length);
        groups.push({ key: '', occurrences: [occurrence], paint, signature });
      } else {
        groups[groupIndex].occurrences.push(occurrence);
      }
    }
  });

  return groups.map((group) => ({ ...group, key: getSelectionColorGroupKey(group.occurrences) }));
};
