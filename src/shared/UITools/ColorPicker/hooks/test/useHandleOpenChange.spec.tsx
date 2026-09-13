import { renderHook } from '@testing-library/react';

// hooks
import { useHandleOpenChange } from '../useHandleOpenChange';

describe('useHandleOpenChange', () => {
  it('should update isOpen and forward the change to handlePopoverOpenChange', () => {
    // mock
    const setIsOpen = vi.fn();
    const handlePopoverOpenChange = vi.fn();

    // before
    const { result } = renderHook(() => useHandleOpenChange(setIsOpen, handlePopoverOpenChange));

    // action
    result.current(true);

    // result
    expect(setIsOpen).toHaveBeenCalledWith(true);
    expect(handlePopoverOpenChange).toHaveBeenCalledWith(true);
  });

  it('should report a close the same way', () => {
    // mock
    const setIsOpen = vi.fn();
    const handlePopoverOpenChange = vi.fn();

    // before
    const { result } = renderHook(() => useHandleOpenChange(setIsOpen, handlePopoverOpenChange));

    // action
    result.current(false);

    // result
    expect(setIsOpen).toHaveBeenCalledWith(false);
    expect(handlePopoverOpenChange).toHaveBeenCalledWith(false);
  });
});
