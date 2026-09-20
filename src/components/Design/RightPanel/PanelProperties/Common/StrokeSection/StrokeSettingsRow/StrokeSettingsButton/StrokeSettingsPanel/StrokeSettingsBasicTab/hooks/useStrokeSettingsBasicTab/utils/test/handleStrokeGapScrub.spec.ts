// utils
import { handleStrokeGapScrub } from '../handleStrokeGapScrub';

describe('handleStrokeGapScrub', () => {
  it('should write the scrubbed value as the gap length', () => {
    // mock
    const update = vi.fn();

    // action
    handleStrokeGapScrub(12, update);

    // result
    expect(update).toHaveBeenCalledWith({ strokeGap: 12 });
  });
});
