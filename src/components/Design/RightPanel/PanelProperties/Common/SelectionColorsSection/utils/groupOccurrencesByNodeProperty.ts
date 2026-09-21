// types
import { TPaintProperty } from 'types/design/paint/types';
import { TSelectionColorOccurrence } from '../types';

export type TSelectionColorOccurrenceGroup = { indices: Set<number>; nodeId: string; property: TPaintProperty };

export const groupOccurrencesByNodeProperty = (occurrences: TSelectionColorOccurrence[]): TSelectionColorOccurrenceGroup[] => {
  const groups: TSelectionColorOccurrenceGroup[] = [];
  const groupIndexByKey = new Map<string, number>();

  occurrences.forEach(({ index, nodeId, property }) => {
    const key = `${nodeId}:${property}`;
    const groupIndex = groupIndexByKey.get(key);

    if (groupIndex === undefined) {
      groupIndexByKey.set(key, groups.length);
      groups.push({ indices: new Set([index]), nodeId, property });
    } else {
      groups[groupIndex].indices.add(index);
    }
  });

  return groups;
};
