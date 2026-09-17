import { renderHook } from '@testing-library/react';

// hooks
import { useHandleClosePicker } from './useHandleClosePicker';

describe('useHandleClosePicker', () => {
  it('should close the owning index when a picker is open', () => {
    // mock
    const onPickerOpenChange = vi.fn();

    // before
    const { result } = renderHook(() => useHandleClosePicker(2, onPickerOpenChange));

    // action
    result.current();

    // result
    expect(onPickerOpenChange).toHaveBeenCalledWith(2, false);
  });

  it('should do nothing when no picker is open', () => {
    // mock
    const onPickerOpenChange = vi.fn();

    // before
    const { result } = renderHook(() => useHandleClosePicker(null, onPickerOpenChange));

    // action
    result.current();

    // result
    expect(onPickerOpenChange).not.toHaveBeenCalled();
  });
});
