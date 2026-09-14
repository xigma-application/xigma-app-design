import { renderHook } from '@testing-library/react';

// hooks
import { useIgnorePatternSourcePickingInteractOutside } from '../useIgnorePatternSourcePickingInteractOutside';

describe('useIgnorePatternSourcePickingInteractOutside', () => {
  it('should prevent the default dismissal while picking a pattern source', () => {
    // before
    const { result } = renderHook(() => useIgnorePatternSourcePickingInteractOutside(true));
    const event = { preventDefault: vi.fn() } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should leave the interaction alone while not picking a pattern source', () => {
    // before
    const { result } = renderHook(() => useIgnorePatternSourcePickingInteractOutside(false));
    const event = { preventDefault: vi.fn() } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
