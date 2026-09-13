// utils
import { resolveFillDragIndices } from '../resolveFillDragIndices';

describe('resolveFillDragIndices', () => {
  it('should return the existing selection when the dragged index is already selected', () => {
    // mock
    const setSelection = vi.fn();

    // before
    const result = resolveFillDragIndices([0, 1], setSelection, 1);

    // result
    expect(result).toEqual([0, 1]);
    expect(setSelection).not.toHaveBeenCalled();
  });

  it('should select just the dragged index when it is not already selected', () => {
    // mock
    const setSelection = vi.fn();

    // before
    const result = resolveFillDragIndices([0, 1], setSelection, 2);

    // result
    expect(result).toEqual([2]);
    expect(setSelection).toHaveBeenCalledWith([2]);
  });
});
