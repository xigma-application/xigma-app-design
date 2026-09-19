// utils
import { handleStrokeBrushCommit } from '../handleStrokeBrushCommit';

describe('handleStrokeBrushCommit', () => {
  it('should restore the original brush silently and then commit the new one', () => {
    // before
    const calls: string[] = [];
    const update = vi.fn(() => calls.push('update'));
    const commit = vi.fn(() => calls.push('commit'));

    // action
    handleStrokeBrushCommit('noir', 'heist', update, commit);

    // result
    expect(update).toHaveBeenCalledWith({ strokeBrush: 'heist' });
    expect(commit).toHaveBeenCalledWith({ strokeBrush: 'noir' });
    expect(calls).toEqual(['update', 'commit']);
  });

  it('should do nothing when the brush did not change', () => {
    // before
    const update = vi.fn();
    const commit = vi.fn();

    // action
    handleStrokeBrushCommit('heist', 'heist', update, commit);

    // result
    expect(update).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
  });
});
