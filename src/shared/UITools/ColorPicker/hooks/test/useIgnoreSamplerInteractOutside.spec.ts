import { renderHook } from '@testing-library/react';

// hooks
import { useIgnoreSamplerInteractOutside } from '../useIgnoreSamplerInteractOutside';

describe('useIgnoreSamplerInteractOutside', () => {
  it('should prevent the default dismissal while the sampler is active', () => {
    // before
    const { result } = renderHook(() => useIgnoreSamplerInteractOutside(true));
    const event = { preventDefault: vi.fn() } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should leave the interaction alone while the sampler is inactive', () => {
    // before
    const { result } = renderHook(() => useIgnoreSamplerInteractOutside(false));
    const event = { preventDefault: vi.fn() } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
