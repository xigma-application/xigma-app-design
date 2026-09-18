import { act, renderHook } from '@testing-library/react';

// hooks
import { useContrastValuesButton } from '../useContrastValuesButton';

describe('useContrastValuesButton', () => {
  it('should default to closed', () => {
    // before
    const { result } = renderHook(() => useContrastValuesButton());

    // result
    expect(result.current.open).toBe(false);
  });

  it('should track the open state through onOpenChange', () => {
    // before
    const { result } = renderHook(() => useContrastValuesButton());

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);
  });
});
