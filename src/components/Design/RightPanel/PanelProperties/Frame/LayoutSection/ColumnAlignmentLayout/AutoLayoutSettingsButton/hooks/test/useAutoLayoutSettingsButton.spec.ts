import { act, renderHook } from '@testing-library/react';

// hooks
import { useAutoLayoutSettingsButton } from '../useAutoLayoutSettingsButton';

describe('useAutoLayoutSettingsButton', () => {
  it('should start closed', () => {
    // before
    const { result } = renderHook(() => useAutoLayoutSettingsButton());

    // result
    expect(result.current.open).toBe(false);
  });

  it('should open when onOpenChange is called with true', () => {
    // before
    const { result } = renderHook(() => useAutoLayoutSettingsButton());

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);
  });

  it('should close when onClose is called', () => {
    // before
    const { result } = renderHook(() => useAutoLayoutSettingsButton());

    act(() => result.current.onOpenChange(true));

    // action
    act(() => result.current.onClose());

    // result
    expect(result.current.open).toBe(false);
  });
});
