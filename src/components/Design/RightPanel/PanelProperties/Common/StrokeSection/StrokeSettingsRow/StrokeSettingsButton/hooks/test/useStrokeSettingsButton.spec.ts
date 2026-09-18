import { act, renderHook } from '@testing-library/react';

// hooks
import { useStrokeSettingsButton } from '../useStrokeSettingsButton';

describe('useStrokeSettingsButton', () => {
  it('should start closed, open through onOpenChange and close through onClose', () => {
    // before
    const { result } = renderHook(() => useStrokeSettingsButton());

    // result
    expect(result.current.open).toBe(false);

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);

    // action
    act(() => result.current.onClose());

    // result
    expect(result.current.open).toBe(false);
  });
});
