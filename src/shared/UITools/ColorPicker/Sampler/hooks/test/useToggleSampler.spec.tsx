import { renderHook } from '@testing-library/react';

// hooks
import { useToggleSampler } from '../useToggleSampler';

describe('useToggleSampler', () => {
  it('should call onOpen when the trigger opens', () => {
    // mock
    const onOpen = vi.fn();
    const onClose = vi.fn();

    // before
    const { result } = renderHook(() => useToggleSampler(onOpen, onClose));

    // action
    result.current(true);

    // result
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should call onClose when the trigger closes', () => {
    // mock
    const onOpen = vi.fn();
    const onClose = vi.fn();

    // before
    const { result } = renderHook(() => useToggleSampler(onOpen, onClose));

    // action
    result.current(false);

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('should not throw when no callbacks are provided', () => {
    // before
    const { result } = renderHook(() => useToggleSampler());

    // action
    const triggerOpen = (): void => result.current(true);
    const triggerClose = (): void => result.current(false);

    // result
    expect(triggerOpen).not.toThrow();
    expect(triggerClose).not.toThrow();
  });
});
