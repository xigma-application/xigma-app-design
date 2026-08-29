import { renderHook } from '@testing-library/react';

// hooks
import { usePreventMenuRefocus } from './usePreventMenuRefocus';

describe('usePreventMenuRefocus', () => {
  it('should prevent the default of the given event', () => {
    // mock
    const preventDefault = vi.fn();

    // before
    const { result } = renderHook(() => usePreventMenuRefocus());

    // action
    result.current({ preventDefault } as unknown as Event);

    // result
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
