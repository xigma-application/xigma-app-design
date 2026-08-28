import { renderHook } from '@testing-library/react';

// hooks
import { useVectorEraseRefs } from './useVectorEraseRefs';

// others
import { ERASER_DEFAULT_DIAMETER_PX } from 'constant/canvas';

describe('useVectorEraseRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useVectorEraseRefs());

    // result
    expect(result.current).toEqual({
      eraseBrushCenterRef: { current: null },
      eraserDiameterRef: { current: ERASER_DEFAULT_DIAMETER_PX },
      vectorEraseStrokeRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useVectorEraseRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.eraserDiameterRef).toBe(firstRefs.eraserDiameterRef);
  });
});
