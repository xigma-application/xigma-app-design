import { renderHook } from '@testing-library/react';

// hooks
import { useReturnFocusOnUserClose } from './useReturnFocusOnUserClose';

describe('useReturnFocusOnUserClose', () => {
  it('should skip the focus return when the panel was closed from elsewhere', () => {
    // Step 1: Prepare
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useReturnFocusOnUserClose(onOpenChange));
    const event = new Event('focus', { cancelable: true });

    // Step 2: Close without the panel's own close action
    result.current.onCloseAutoFocus(event);

    // Step 3: Assert
    expect(event.defaultPrevented).toBe(true);
  });

  it('should keep the default focus return once after the user closes the panel', () => {
    // Step 1: Prepare
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useReturnFocusOnUserClose(onOpenChange));
    const first = new Event('focus', { cancelable: true });
    const second = new Event('focus', { cancelable: true });

    // Step 2: User close, then close twice
    result.current.markUserClose();
    result.current.onCloseAutoFocus(first);
    result.current.onCloseAutoFocus(second);

    // Step 3: Assert
    expect(first.defaultPrevented).toBe(false);
    expect(second.defaultPrevented).toBe(true);
  });

  it('should close the panel and keep the default focus return when closed through onClose', () => {
    // Step 1: Prepare
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useReturnFocusOnUserClose(onOpenChange));
    const event = new Event('focus', { cancelable: true });

    // Step 2: Close from the panel itself
    result.current.onClose();
    result.current.onCloseAutoFocus(event);

    // Step 3: Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(event.defaultPrevented).toBe(false);
  });
});
