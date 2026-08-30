// utils
import { getDraggedIndices } from '../getDraggedIndices';

describe('getDraggedIndices', () => {
  it('should return just the clicked index when isRowSelected is not provided', () => {
    // action & result
    expect(getDraggedIndices(2, 5)).toEqual([2]);
  });

  it('should return just the clicked index when nothing is selected', () => {
    // action & result
    expect(getDraggedIndices(2, 5, () => false)).toEqual([2]);
  });

  it('should return just the clicked index when it is the only selected row', () => {
    // action & result
    expect(getDraggedIndices(2, 5, (index) => index === 2)).toEqual([2]);
  });

  it('should return every selected index, in ascending order, when dragging a row that is part of a multi-selection', () => {
    // action & result
    expect(getDraggedIndices(3, 6, (index) => [1, 3, 4].includes(index))).toEqual([1, 3, 4]);
  });

  it('should return just the clicked index when dragging a row that is not part of the current selection', () => {
    // action & result
    expect(getDraggedIndices(2, 6, (index) => [1, 3, 4].includes(index))).toEqual([2]);
  });
});
