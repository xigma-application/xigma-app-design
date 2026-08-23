import { act, renderHook } from '@testing-library/react';

// hooks
import { useVectorEditMoreDropdownPlaceholder } from '../useVectorEditMoreDropdownPlaceholder';

describe('useVectorEditMoreDropdownPlaceholder', () => {
  it('should start closed', () => {
    // before
    const { result } = renderHook(() => useVectorEditMoreDropdownPlaceholder());

    // result
    expect(result.current.isOpen).toBe(false);
  });

  it('should track the open state via handleOpenChange', () => {
    // before
    const { result } = renderHook(() => useVectorEditMoreDropdownPlaceholder());

    // action
    act(() => {
      result.current.handleOpenChange(true);
    });

    // result
    expect(result.current.isOpen).toBe(true);

    // action
    act(() => {
      result.current.handleOpenChange(false);
    });

    // result
    expect(result.current.isOpen).toBe(false);
  });
});
