import { renderHook } from '@testing-library/react';

// hooks
import { useHoverRefs } from './useHoverRefs';

describe('useHoverRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useHoverRefs());

    // result
    expect(result.current).toEqual({
      hoverRef: { current: null },
      hoveredSegmentIdRef: { current: null },
      hoveredVectorCutPointRef: { current: null },
      hoveredVectorCutSegmentRef: { current: null },
      hoveredVectorEdgeInsertPointRef: { current: null },
      hoveredVectorFaceSelectRef: { current: null },
      hoveredVectorHandleRef: { current: null },
      hoveredVectorPaintFaceKeyRef: { current: null },
      hoveredVectorSegmentIdRef: { current: null },
      hoveredVectorShapeBuilderFaceRef: { current: null },
      hoveredVectorVertexIdRef: { current: null },
      hoveredVectorWidthPointRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useHoverRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.hoverRef).toBe(firstRefs.hoverRef);
  });
});
