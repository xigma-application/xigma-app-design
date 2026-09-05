import { renderHook } from '@testing-library/react';

// hooks
import { useTransformRefs } from './useTransformRefs';

describe('useTransformRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useTransformRefs());

    // result
    expect(result.current).toEqual({
      alignmentGuideRef: { current: null },
      aspectRatioLockGuideRef: { current: null },
      autoLayoutDropTargetRef: { current: null },
      autoLayoutReorderPreviewRef: { current: null },
      contactGuidesRef: { current: null },
      distanceGuidesRef: { current: null },
      draggedNodeIdsRef: { current: null },
      dropTargetFrameIdRef: { current: null },
      equalSpacingGuidesRef: { current: null },
      matchedPairGuidesRef: { current: null },
      resizedNodeIdsRef: { current: null },
      rotateDragRef: { current: null },
      rotatedNodeIdsRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useTransformRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.rotateDragRef).toBe(firstRefs.rotateDragRef);
  });
});
