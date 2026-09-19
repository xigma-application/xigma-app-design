// types
import { StrokeDashCap } from 'types/design/enums';

// utils
import { handleStrokeDashCapSelect } from '../handleStrokeDashCapSelect';

describe('handleStrokeDashCapSelect', () => {
  it('should commit a different known cap', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeDashCapSelect('round', StrokeDashCap.none, commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeDashCap: StrokeDashCap.round });
  });

  it('should ignore the current cap and unknown values', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeDashCapSelect('round', StrokeDashCap.round, commit);
    handleStrokeDashCapSelect('nope', StrokeDashCap.none, commit);
    handleStrokeDashCapSelect('', StrokeDashCap.none, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
  });
});
