// utils
import { handleStrokeMiterAngleScrub } from '../handleStrokeMiterAngleScrub';

describe('handleStrokeMiterAngleScrub', () => {
  it('should write the scrubbed angle rounded and clamped to the allowed range', () => {
    // before
    const update = vi.fn();

    // action
    handleStrokeMiterAngleScrub(45.678, update);
    handleStrokeMiterAngleScrub(999, update);
    handleStrokeMiterAngleScrub(-3, update);

    // result
    expect(update).toHaveBeenNthCalledWith(1, { strokeMiterAngle: 45.68 });
    expect(update).toHaveBeenNthCalledWith(2, { strokeMiterAngle: 180 });
    expect(update).toHaveBeenNthCalledWith(3, { strokeMiterAngle: 7.17 });
  });
});
