import { renderHook } from '@testing-library/react';

// hooks
import { useHandleInteractOutside } from '../useHandleInteractOutside';

describe('useHandleInteractOutside', () => {
  it('should call both ignore handlers with the same event', () => {
    // mock
    const ignoreSamplerInteractOutside = vi.fn();
    const ignoreGradientCanvasInteractOutside = vi.fn();

    // before
    const { result } = renderHook(() => useHandleInteractOutside(ignoreSamplerInteractOutside, ignoreGradientCanvasInteractOutside));
    const event = {} as Event;

    // action
    result.current(event);

    // result
    expect(ignoreSamplerInteractOutside).toHaveBeenCalledWith(event);
    expect(ignoreGradientCanvasInteractOutside).toHaveBeenCalledWith(event);
  });
});
