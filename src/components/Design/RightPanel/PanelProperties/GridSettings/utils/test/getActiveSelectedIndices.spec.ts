// utils
import { getActiveSelectedIndices } from '../getActiveSelectedIndices';

describe('getActiveSelectedIndices', () => {
  it('should return the column-selected indices when the column axis is active', () => {
    expect(getActiveSelectedIndices('column', [1, 2], [])).toEqual([1, 2]);
  });

  it('should return the row-selected indices when the row axis is active', () => {
    expect(getActiveSelectedIndices('row', [], [0, 3])).toEqual([0, 3]);
  });

  it('should return an empty array when there is no active axis', () => {
    expect(getActiveSelectedIndices(null, [0], [1])).toEqual([]);
  });
});
