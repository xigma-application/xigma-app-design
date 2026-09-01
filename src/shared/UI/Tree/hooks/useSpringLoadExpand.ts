// types
import { TTreeItem, TTreeRow } from '../types';

export const useSpringLoadExpand = <T extends TTreeItem>(
  rows: TTreeRow<T>[],
  onToggleExpand: (row: TTreeRow<T>) => void,
): ((itemId: string) => void) => {
  return (itemId: string): void => {
    const row = rows.find((candidate) => candidate.item.id === itemId);

    if (row && !row.isExpanded) {
      onToggleExpand(row);
    }
  };
};
