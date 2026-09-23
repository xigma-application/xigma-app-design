import { renderHook } from '@testing-library/react';

// hooks
import { useHandleEmptySectionClick } from '../useHandleEmptySectionClick';

describe('useHandleEmptySectionClick', () => {
  it('should call onAdd when invoked', () => {
    // mock
    const onAdd = vi.fn();

    // before
    const { result } = renderHook(() => useHandleEmptySectionClick(onAdd));

    // action
    result.current();

    // result
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('should not throw when onAdd is not given', () => {
    // before
    const { result } = renderHook(() => useHandleEmptySectionClick());

    // result
    expect(result.current).not.toThrow();
  });
});
