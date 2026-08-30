import { renderHook } from '@testing-library/react';

// hooks
import { useSectionNameRefs } from './useSectionNameRefs';

describe('useSectionNameRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useSectionNameRefs());

    // result
    expect(result.current).toEqual({ editingLabelRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useSectionNameRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.editingLabelRef).toBe(firstRefs.editingLabelRef);
  });
});
