// types
import { TTreeItem, TTreeRow } from '../types';

export const getIsRowSelectedByIndex = <T extends TTreeItem>(
  rows: TTreeRow<T>[],
  isRowSelected?: (item: T) => boolean,
): ((index: number) => boolean) | undefined => {
  if (isRowSelected) {
    return (index: number): boolean => index >= 0 && index < rows.length && isRowSelected(rows[index].item);
  }

  return undefined;
};
