import { renderHook } from '@testing-library/react';

// hooks
import { usePenRefs } from './usePenRefs';

describe('usePenRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => usePenRefs());

    // result
    expect(result.current).toEqual({
      penDragOriginRef: { current: null },
      penDraggedHandleIsSnappedRef: { current: false },
      penDraggedHandlePositionRef: { current: null },
      penHoveredDragArmableVertexRef: { current: false },
      penNewVertexPreviewRef: { current: null },
      penPreviewRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => usePenRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.penPreviewRef).toBe(firstRefs.penPreviewRef);
  });
});
