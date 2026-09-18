// utils
import { applyContrastCorrection } from '../applyContrastCorrection';

describe('applyContrastCorrection', () => {
  it('should hand the target to onCorrect', () => {
    // mock
    const onCorrect = vi.fn();

    // action
    applyContrastCorrection({ h: 0, s: 10, v: 20 }, onCorrect, vi.fn());

    // result
    expect(onCorrect).toHaveBeenCalledWith({ h: 0, s: 10, v: 20 });
  });

  it('should do nothing without a target', () => {
    // mock
    const onCorrect = vi.fn();

    // action
    applyContrastCorrection(null, onCorrect, vi.fn());

    // result
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('should always report that the correction was applied so hover state can be cleared', () => {
    // mock
    const onApplied = vi.fn();

    // action
    applyContrastCorrection(null, vi.fn(), onApplied);

    // result
    expect(onApplied).toHaveBeenCalledTimes(1);
  });
});
