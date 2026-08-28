import { renderHook } from '@testing-library/react';

// hooks
import { useVectorEditRefs } from './useVectorEditRefs';

describe('useVectorEditRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useVectorEditRefs());

    // result
    expect(result.current).toEqual({
      lastVectorWidthHandleSideRef: { current: null },
      preVectorMarqueeSegmentIdsRef: { current: [] },
      preVectorMarqueeVertexIdsRef: { current: [] },
      selectedVectorHandlesRef: { current: [] },
      selectedVectorSegmentIdsRef: { current: [] },
      selectedVectorVertexIdsRef: { current: [] },
      selectedVectorWidthHandlesRef: { current: [] },
      snappedVectorHandleRef: { current: null },
      vectorAlignmentGuideRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useVectorEditRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.selectedVectorVertexIdsRef).toBe(firstRefs.selectedVectorVertexIdsRef);
  });
});
