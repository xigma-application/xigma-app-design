// utils
import { getItemsWithPatch } from '../getItemsWithPatch';

describe('getItemsWithPatch', () => {
  it('should patch only the item at the index', () => {
    // before
    const result = getItemsWithPatch([{ a: 1 }, { a: 2 }], 1, (item) => ({ a: item.a * 10 }));

    // result
    expect(result).toEqual([{ a: 1 }, { a: 20 }]);
  });
});
