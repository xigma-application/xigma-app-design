// utils
import { handleFillReorder } from '../handleFillReorder';

const paint = (color: string): { color: string; opacity: number; type: 'solid' } => ({ color, opacity: 100, type: 'solid' });

describe('handleFillReorder', () => {
  it('should delegate to commitFillReorder with the given arguments', () => {
    // mock
    const commit = vi.fn();
    const setSelection = vi.fn();
    const fills = [paint('a'), paint('b')];

    // before
    handleFillReorder(fills, commit, setSelection, [0], 2, 0, true);

    // result
    expect(commit).toHaveBeenCalledWith([paint('b'), paint('a')]);
    expect(setSelection).toHaveBeenCalledWith([1]);
  });
});
