// utils
import { getStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';
import { handleStrokeBrushCommit } from '../handleStrokeBrushCommit';

describe('handleStrokeBrushCommit', () => {
  it('should revert the preview and commit a brush that differs from the originals', () => {
    // mock
    const onBrushRevert = vi.fn();
    const commit = vi.fn();

    // action
    handleStrokeBrushCommit('noir', [{ brush: 'heist', id: 'a' }], [getStrokeBrushValues(undefined)], onBrushRevert, commit);

    // result
    expect(onBrushRevert).toHaveBeenCalled();
    expect(commit).toHaveBeenCalledWith({ strokeBrush: 'noir' });
  });

  it('should compare against the originals rather than the previewed values', () => {
    // mock
    const commit = vi.fn();
    const previewed = [{ ...getStrokeBrushValues(undefined), brush: 'noir' }];

    // action
    handleStrokeBrushCommit('noir', [{ brush: 'heist', id: 'a' }], previewed, vi.fn(), commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeBrush: 'noir' });
  });

  it('should not commit when every node already has the picked brush', () => {
    // mock
    const commit = vi.fn();

    // action
    handleStrokeBrushCommit('heist', null, [getStrokeBrushValues(undefined)], vi.fn(), commit);

    // result
    expect(commit).not.toHaveBeenCalled();
  });
});
