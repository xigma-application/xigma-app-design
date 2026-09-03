import { renderHook } from '@testing-library/react';

// hooks
import { useSnackbarAutoHide } from '../useSnackbarAutoHide';

describe('useSnackbarAutoHide behaviors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call onHide once the given duration has elapsed', () => {
    // mock
    const onHide = vi.fn();

    // before
    renderHook(() => useSnackbarAutoHide(3000, onHide));

    // action
    vi.advanceTimersByTime(3000);

    // result
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('should not call onHide before the duration has elapsed', () => {
    // mock
    const onHide = vi.fn();

    // before
    renderHook(() => useSnackbarAutoHide(3000, onHide));

    // action
    vi.advanceTimersByTime(2999);

    // result
    expect(onHide).not.toHaveBeenCalled();
  });

  it('should do nothing when durationMs is not given', () => {
    // mock
    const onHide = vi.fn();

    // before
    renderHook(() => useSnackbarAutoHide(undefined, onHide));

    // action
    vi.advanceTimersByTime(10000);

    // result
    expect(onHide).not.toHaveBeenCalled();
  });

  it('should do nothing when onHide is not given', () => {
    // before
    const { result } = renderHook(() => useSnackbarAutoHide(3000, undefined));

    // action / result
    expect(() => vi.advanceTimersByTime(3000)).not.toThrow();
    expect(result.current).toBeUndefined();
  });

  it('should clear the pending timeout on unmount', () => {
    // mock
    const onHide = vi.fn();

    // before
    const { unmount } = renderHook(() => useSnackbarAutoHide(3000, onHide));

    // action
    unmount();
    vi.advanceTimersByTime(3000);

    // result
    expect(onHide).not.toHaveBeenCalled();
  });
});
