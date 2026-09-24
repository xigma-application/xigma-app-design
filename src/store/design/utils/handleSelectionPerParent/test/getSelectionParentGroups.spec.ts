// types
import { TDesignPage } from '../../../types';

// utils
import { getSelectionParentGroups } from '../getSelectionParentGroups';

describe('getSelectionParentGroups', () => {
  it('should group the selected ids by parent in selection order', () => {
    // mock
    const page = {
      nodes: { a: { parentId: null }, b: { parentId: 'frame' }, c: { parentId: null }, d: { parentId: 'frame' } },
      selectedIds: ['a', 'b', 'c', 'd'],
    } as unknown as TDesignPage;

    // action / result
    expect(getSelectionParentGroups(page)).toEqual([
      ['a', 'c'],
      ['b', 'd'],
    ]);
  });
});
