// types
import { StrokeBrushDirection } from 'types/design/enums';

// utils
import { handleStrokeBrushDirectionChange } from '../handleStrokeBrushDirectionChange';

describe('handleStrokeBrushDirectionChange', () => {
  it('should commit a known changed direction only', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeBrushDirectionChange('left', StrokeBrushDirection.right, commit);
    handleStrokeBrushDirectionChange('left', StrokeBrushDirection.left, commit);
    handleStrokeBrushDirectionChange('up', StrokeBrushDirection.right, commit);

    // result
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith({ strokeBrushDirection: StrokeBrushDirection.left });
  });
});
