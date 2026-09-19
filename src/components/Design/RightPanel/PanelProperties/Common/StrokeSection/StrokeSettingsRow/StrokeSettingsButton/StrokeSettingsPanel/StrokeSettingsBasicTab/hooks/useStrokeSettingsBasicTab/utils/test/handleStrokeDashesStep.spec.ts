// utils
import { handleStrokeDashesStep } from '../handleStrokeDashesStep';

describe('handleStrokeDashesStep', () => {
  it('should commit the stepped list', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeDashesStep('9, 5, 7, 9', [8, 4, 6, 8], commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeDashes: [9, 5, 7, 9] });
  });

  it('should not commit an unchanged or unusable list', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeDashesStep('8, 4', [8, 4], commit);
    handleStrokeDashesStep('0, 0', [8, 4], commit);

    // result
    expect(commit).not.toHaveBeenCalled();
  });
});
