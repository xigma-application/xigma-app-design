// types
import { TArmedRowDrag } from '../types';
import { TTreeItem, TTreeRow } from '../../../types';

export const resyncArmedIndices = <T extends TTreeItem>(armed: TArmedRowDrag, rows: TTreeRow<T>[]): void => {
  const draggedIdSet = new Set(armed.ids);
  const indices = rows.reduce<number[]>((accumulator, row, index) => {
    if (draggedIdSet.has(row.item.id)) {
      accumulator.push(index);
    }

    return accumulator;
  }, []);

  if (indices.length === armed.ids.length) {
    armed.indices = indices;
  }
};
