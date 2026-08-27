import { renderHook } from '@testing-library/react';

// hooks
import { usePickSampledColor } from '../usePickSampledColor';

describe('usePickSampledColor', () => {
  it('should call onPick with the hex of the grid center color', () => {
    // mock
    const onPick = vi.fn();
    const colors = Array.from({ length: 49 }, () => ({ a: 255, b: 0, g: 0, r: 0 }));

    colors[24] = { a: 255, b: 0, g: 128, r: 255 };

    // before
    const { result } = renderHook(() => usePickSampledColor(colors, onPick));

    // action
    result.current();

    // result
    expect(onPick).toHaveBeenCalledWith('#ff8000');
  });

  it('should fall back to black when no colors have been sampled yet', () => {
    // mock
    const onPick = vi.fn();

    // before
    const { result } = renderHook(() => usePickSampledColor([], onPick));

    // action
    result.current();

    // result
    expect(onPick).toHaveBeenCalledWith('#000000');
  });
});
