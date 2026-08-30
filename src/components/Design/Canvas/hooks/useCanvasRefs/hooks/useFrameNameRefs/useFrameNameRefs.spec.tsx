import { renderHook } from '@testing-library/react';

// hooks
import { useFrameNameRefs } from './useFrameNameRefs';

describe('useFrameNameRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useFrameNameRefs());

    // result
    expect(result.current).toEqual({ editingLabelRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useFrameNameRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.editingLabelRef).toBe(firstRefs.editingLabelRef);
  });
});
