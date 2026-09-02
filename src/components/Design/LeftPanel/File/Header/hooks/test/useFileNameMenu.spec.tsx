import { renderHook } from '@testing-library/react';

// hooks
import { useFileNameMenu } from '../useFileNameMenu';

describe('useFileNameMenu', () => {
  it('should start closed', () => {
    // before
    const { result } = renderHook(() => useFileNameMenu());

    // result
    expect(result.current.isOpen).toBe(false);
  });

  it('should update isOpen when onOpenChange is called', () => {
    // before
    const { rerender, result } = renderHook(() => useFileNameMenu());

    // action
    result.current.onOpenChange(true);
    rerender();

    // result
    expect(result.current.isOpen).toBe(true);

    // action
    result.current.onOpenChange(false);
    rerender();

    // result
    expect(result.current.isOpen).toBe(false);
  });
});
