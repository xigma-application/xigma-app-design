import { renderHook } from '@testing-library/react';

// hooks
import { useHandleFillModeChange } from '../useHandleFillModeChange';

describe('useHandleFillModeChange', () => {
  it('should call both the local setter and the scale-mode commit callback', () => {
    // mock
    const setFillMode = vi.fn();
    const onScaleModeChange = vi.fn();

    // before
    const { result } = renderHook(() => useHandleFillModeChange(setFillMode, onScaleModeChange));

    // action
    result.current('fit');

    // result
    expect(setFillMode).toHaveBeenCalledWith('fit');
    expect(onScaleModeChange).toHaveBeenCalledWith('fit');
  });

  it('should not throw when no scale-mode commit callback is given', () => {
    // mock
    const setFillMode = vi.fn();

    // before
    const { result } = renderHook(() => useHandleFillModeChange(setFillMode));

    // result
    expect(() => result.current('crop')).not.toThrow();
    expect(setFillMode).toHaveBeenCalledWith('crop');
  });
});
