import { renderHook } from '@testing-library/react';

// hooks
import { usePencilRefs } from './usePencilRefs';

describe('usePencilRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => usePencilRefs());

    // result
    expect(result.current).toEqual({
      pencilPreviewPointsRef: { current: null },
      pencilRawPreviewPointsRef: { current: null },
      pencilShowRawPreviewRef: { current: false },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => usePencilRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.pencilPreviewPointsRef).toBe(firstRefs.pencilPreviewPointsRef);
  });
});
