// utils
import { commitFillReorder } from '../commitFillReorder';

const paint = (color: string): { color: string; opacity: number; type: 'solid' } => ({ color, opacity: 100, type: 'solid' });

describe('commitFillReorder', () => {
  it('should only reselect the grabbed row when it has not moved', () => {
    // mock
    const commit = vi.fn();
    const setSelection = vi.fn();
    const fills = [paint('a'), paint('b')];

    // before
    commitFillReorder(fills, commit, setSelection, [0], 0, 0, false);

    // result
    expect(setSelection).toHaveBeenCalledWith([0]);
    expect(commit).not.toHaveBeenCalled();
  });

  it('should commit the reordered fills and reselect them when moved', () => {
    // mock
    const commit = vi.fn();
    const setSelection = vi.fn();
    const fills = [paint('a'), paint('b'), paint('c')];

    // before
    commitFillReorder(fills, commit, setSelection, [0], 3, 0, true);

    // result
    expect(commit).toHaveBeenCalledWith([paint('b'), paint('c'), paint('a')]);
    expect(setSelection).toHaveBeenCalledWith([2]);
  });
});
