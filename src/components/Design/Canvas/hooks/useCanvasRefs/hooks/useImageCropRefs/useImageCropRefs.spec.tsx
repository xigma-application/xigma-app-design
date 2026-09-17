import { renderHook } from '@testing-library/react';

// hooks
import { useImageCropRefs } from './useImageCropRefs';

describe('useImageCropRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useImageCropRefs());

    // result
    expect(result.current).toEqual({
      imageCropMoveDragRef: { current: null },
      imageCropResizeDragRef: { current: null },
      imageCropRotateDragRef: { current: null },
      imageTileScaleDragRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useImageCropRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.imageCropMoveDragRef).toBe(firstRefs.imageCropMoveDragRef);
  });
});
