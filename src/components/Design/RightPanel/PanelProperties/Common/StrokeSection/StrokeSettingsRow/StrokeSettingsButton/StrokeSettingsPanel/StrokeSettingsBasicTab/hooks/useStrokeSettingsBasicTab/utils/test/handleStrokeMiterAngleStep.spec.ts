// utils
import { handleStrokeMiterAngleStep } from '../handleStrokeMiterAngleStep';

describe('handleStrokeMiterAngleStep', () => {
  it('should commit a changed value and ignore an unchanged or invalid one', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeMiterAngleStep('30', 28.96, commit);
    handleStrokeMiterAngleStep('28.96', 28.96, commit);
    handleStrokeMiterAngleStep('nope', 28.96, commit);

    // result
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith({ strokeMiterAngle: 30 });
  });
});
