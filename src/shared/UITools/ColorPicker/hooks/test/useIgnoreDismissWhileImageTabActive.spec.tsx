import { renderHook } from '@testing-library/react';

// hooks
import { useIgnoreDismissWhileImageTabActive } from '../useIgnoreDismissWhileImageTabActive';

describe('useIgnoreDismissWhileImageTabActive', () => {
  it('should prevent the default dismissal while the Image tab is active', () => {
    // before
    const { result } = renderHook(() => useIgnoreDismissWhileImageTabActive(true));
    const event = { preventDefault: vi.fn() } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should leave the dismissal alone when the Image tab is not active', () => {
    // before
    const { result } = renderHook(() => useIgnoreDismissWhileImageTabActive(false));
    const event = { preventDefault: vi.fn() } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
