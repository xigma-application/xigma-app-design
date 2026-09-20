// utils
import { handleStrokeDashScrub } from '../handleStrokeDashScrub';

describe('handleStrokeDashScrub', () => {
  it('should write the scrubbed value as the dash length, without a history entry of its own', () => {
    // mock
    const update = vi.fn();

    // action
    handleStrokeDashScrub(35, update);

    // result
    expect(update).toHaveBeenCalledWith({ strokeDash: 35 });
  });

  it('should cap the dash length at its maximum', () => {
    // mock
    const update = vi.fn();

    // action
    handleStrokeDashScrub(999999, update);

    // result
    expect(update).toHaveBeenCalledWith({ strokeDash: 100000 });
  });
});
