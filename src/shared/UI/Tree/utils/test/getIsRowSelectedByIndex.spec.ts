// types
import { TTreeItem, TTreeRow } from '../../types';

// utils
import { getIsRowSelectedByIndex } from '../getIsRowSelectedByIndex';

type TItem = TTreeItem;

const buildRow = (id: string): TTreeRow<TItem> => ({ depth: 0, hasChildren: false, isExpanded: false, item: { id }, parentItem: null });

describe('getIsRowSelectedByIndex', () => {
  it('should return undefined when isRowSelected is not provided', () => {
    // action & result
    expect(getIsRowSelectedByIndex([buildRow('a')])).toBeUndefined();
  });

  it('should resolve the row at the given index and forward it to isRowSelected', () => {
    // mock
    const rows = [buildRow('a'), buildRow('b')];
    const isRowSelected = (item: TItem): boolean => item.id === 'a';

    // before
    const result = getIsRowSelectedByIndex(rows, isRowSelected);

    // action & result
    expect(result?.(0)).toBe(true);
    expect(result?.(1)).toBe(false);
  });

  it('should return false for an out-of-range index without calling isRowSelected', () => {
    // mock
    const rows = [buildRow('a')];
    const isRowSelected = vi.fn(() => true);

    // before
    const result = getIsRowSelectedByIndex(rows, isRowSelected);

    // action & result
    expect(result?.(-1)).toBe(false);
    expect(result?.(1)).toBe(false);
    expect(isRowSelected).not.toHaveBeenCalled();
  });
});
