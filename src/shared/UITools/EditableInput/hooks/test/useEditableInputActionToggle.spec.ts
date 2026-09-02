import { renderHook } from '@testing-library/react';

// hooks
import { useEditableInputActionToggle } from '../useEditableInputActionToggle';

describe('useEditableInputActionToggle', () => {
  it('should toggle its own state when uncontrolled', () => {
    // before
    const { rerender, result } = renderHook(() => useEditableInputActionToggle());

    // result
    expect(result.current.isActionOpen).toBe(false);

    // action
    result.current.toggleAction();
    rerender();

    // result
    expect(result.current.isActionOpen).toBe(true);
  });

  it('should defer to onOpenChange instead of its own state when controlled', () => {
    // mock
    const onOpenChange = vi.fn();

    // before
    const { rerender, result } = renderHook(() => useEditableInputActionToggle(false, onOpenChange));

    // action
    result.current.toggleAction();
    rerender();

    // result — the caller decides, so isActionOpen still reflects the (unchanged) prop
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(result.current.isActionOpen).toBe(false);
  });
});
