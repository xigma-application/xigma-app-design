import { act, renderHook } from '@testing-library/react';

// hooks
import { useSelectPresentMode } from '../useSelectPresentMode';

describe('useSelectPresentMode', () => {
  it('should start in present mode and switch to the picked mode', () => {
    // before
    const { result } = renderHook(() => useSelectPresentMode());

    // result
    expect(result.current.presentMode).toBe('present');

    // action
    act(() => result.current.selectPresentMode('prototype' as never)());

    // result
    expect(result.current.presentMode).toBe('prototype');
  });
});
