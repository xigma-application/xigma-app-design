import { renderHook } from '@testing-library/react';

// hooks
import { useVectorCutRefs } from './useVectorCutRefs';

describe('useVectorCutRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useVectorCutRefs());

    // result
    expect(result.current).toEqual({
      newVectorCutVertexIdsRef: { current: new Set() },
      touchedVectorCutVertexIdsRef: { current: new Set() },
      vectorCutPreviewRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useVectorCutRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.vectorCutPreviewRef).toBe(firstRefs.vectorCutPreviewRef);
  });
});
