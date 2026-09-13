// utils
import { getFillToggledIndices } from '../getFillToggledIndices';

describe('getFillToggledIndices', () => {
  it('should add an unselected index, keeping the result sorted', () => {
    expect(getFillToggledIndices([0, 2], 1)).toEqual([0, 1, 2]);
  });

  it('should remove an already-selected index', () => {
    expect(getFillToggledIndices([0, 1, 2], 1)).toEqual([0, 2]);
  });
});
