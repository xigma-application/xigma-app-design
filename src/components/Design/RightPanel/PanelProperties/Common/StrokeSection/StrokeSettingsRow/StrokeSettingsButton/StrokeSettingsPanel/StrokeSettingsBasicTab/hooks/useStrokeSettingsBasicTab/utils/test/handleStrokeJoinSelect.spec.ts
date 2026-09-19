// types
import { StrokeJoin } from 'types/design/enums';

// utils
import { handleStrokeJoinSelect } from '../handleStrokeJoinSelect';

describe('handleStrokeJoinSelect', () => {
  it('should commit a different known join', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeJoinSelect('bevel', StrokeJoin.miter, commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeJoin: StrokeJoin.bevel });
  });

  it('should ignore the current join and unknown values', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeJoinSelect('miter', StrokeJoin.miter, commit);
    handleStrokeJoinSelect('nope', StrokeJoin.miter, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
  });
});
