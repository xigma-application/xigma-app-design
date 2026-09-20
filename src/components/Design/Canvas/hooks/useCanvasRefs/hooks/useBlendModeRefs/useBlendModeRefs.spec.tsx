import { renderHook } from '@testing-library/react';

// hooks
import { useBlendModeRefs } from './useBlendModeRefs';

describe('useBlendModeRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useBlendModeRefs());

    // result
    expect(result.current).toEqual({ effectPreviewRef: { current: null }, previewRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useBlendModeRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.previewRef).toBe(firstRefs.previewRef);
  });
});
