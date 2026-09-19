// utils
import { handleStrokeGapStep } from '../handleStrokeGapStep';

describe('handleStrokeGapStep', () => {
  it('should commit a changed value and ignore an unchanged or invalid one', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeGapStep('21', 20, commit);
    handleStrokeGapStep('20', 20, commit);
    handleStrokeGapStep('nope', 20, commit);

    // result
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith({ strokeGap: 21 });
  });
});
