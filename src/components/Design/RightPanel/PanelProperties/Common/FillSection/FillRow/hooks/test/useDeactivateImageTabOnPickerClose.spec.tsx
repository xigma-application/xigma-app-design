import { renderHook } from '@testing-library/react';

// hooks
import { useDeactivateImageTabOnPickerClose } from '../useDeactivateImageTabOnPickerClose';

describe('useDeactivateImageTabOnPickerClose', () => {
  it('should deactivate the Image tab when the picker starts closed', () => {
    // mock
    const setIsImageTabActive = vi.fn();

    // before
    renderHook(() => useDeactivateImageTabOnPickerClose(false, setIsImageTabActive));

    // result
    expect(setIsImageTabActive).toHaveBeenCalledWith(false);
  });

  it('should not deactivate the Image tab while the picker stays open', () => {
    // mock
    const setIsImageTabActive = vi.fn();

    // before
    renderHook(() => useDeactivateImageTabOnPickerClose(true, setIsImageTabActive));

    // result
    expect(setIsImageTabActive).not.toHaveBeenCalled();
  });

  it("should deactivate the Image tab once the picker transitions from open to closed (regression: switching to a different fill row left the old row's isImageTabActive frozen true, so the global imageEditor state never cleared)", () => {
    // mock
    const setIsImageTabActive = vi.fn();

    // before
    const { rerender } = renderHook(({ isPickerOpen }) => useDeactivateImageTabOnPickerClose(isPickerOpen, setIsImageTabActive), {
      initialProps: { isPickerOpen: true },
    });

    setIsImageTabActive.mockClear();

    // action — another row takes over, this one's picker unmounts/closes
    rerender({ isPickerOpen: false });

    // result
    expect(setIsImageTabActive).toHaveBeenCalledWith(false);
  });
});
