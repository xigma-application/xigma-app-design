import { act, renderHook } from '@testing-library/react';

// hooks
import { useContrastSettingsMenu } from '../useContrastSettingsMenu';

describe('useContrastSettingsMenu', () => {
  it('should default to closed', () => {
    // before
    const { result } = renderHook(() => useContrastSettingsMenu());

    // result
    expect(result.current.open).toBe(false);
  });

  it('should track the open state through onOpenChange', () => {
    // before
    const { result } = renderHook(() => useContrastSettingsMenu());

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);
  });
});
