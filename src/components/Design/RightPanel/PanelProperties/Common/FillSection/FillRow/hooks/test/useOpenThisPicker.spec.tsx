import { renderHook } from '@testing-library/react';

// hooks
import { useOpenThisPicker } from '../useOpenThisPicker';

describe('useOpenThisPicker', () => {
  it('should call onPickerOpenChange with true', () => {
    // mock
    const onPickerOpenChange = vi.fn();
    const { result } = renderHook(() => useOpenThisPicker(onPickerOpenChange));

    // action
    result.current();

    // result
    expect(onPickerOpenChange).toHaveBeenCalledWith(true);
  });
});
