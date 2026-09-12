import { act, renderHook } from '@testing-library/react';

// hooks
import { useCornerSmoothingButton } from '../useCornerSmoothingButton';

describe('useCornerSmoothingButton', () => {
  it('should start closed', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingButton());

    // result
    expect(result.current.open).toBe(false);
  });

  it('should open when onOpenChange is called with true', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingButton());

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);
  });

  it('should close when onClose is called', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingButton());

    act(() => result.current.onOpenChange(true));

    // action
    act(() => result.current.onClose());

    // result
    expect(result.current.open).toBe(false);
  });
});
