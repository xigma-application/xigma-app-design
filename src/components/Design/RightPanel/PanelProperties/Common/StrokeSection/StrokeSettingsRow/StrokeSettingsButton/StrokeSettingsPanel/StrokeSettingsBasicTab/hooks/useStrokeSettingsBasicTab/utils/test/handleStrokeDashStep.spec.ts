// utils
import { handleStrokeDashStep } from '../handleStrokeDashStep';

describe('handleStrokeDashStep', () => {
  it('should commit a changed value and ignore an unchanged or invalid one', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeDashStep('21', 20, commit);
    handleStrokeDashStep('20', 20, commit);
    handleStrokeDashStep('nope', 20, commit);

    // result
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith({ strokeDash: 21 });
  });
});
