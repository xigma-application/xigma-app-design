// types
import { StrokeStyle } from 'types/design/enums';

// utils
import { handleStrokeStyleSelect } from '../handleStrokeStyleSelect';

describe('handleStrokeStyleSelect', () => {
  it('should commit a different style', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeStyleSelect(StrokeStyle.dashed, StrokeStyle.solid, commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeStyle: StrokeStyle.dashed });
  });

  it('should ignore the current style and unknown values', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeStyleSelect(StrokeStyle.solid, StrokeStyle.solid, commit);
    handleStrokeStyleSelect('nope' as StrokeStyle, StrokeStyle.solid, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
  });
});
