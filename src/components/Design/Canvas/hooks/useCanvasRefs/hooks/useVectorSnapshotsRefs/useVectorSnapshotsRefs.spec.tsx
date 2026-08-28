import { renderHook } from '@testing-library/react';

// hooks
import { useVectorSnapshotsRefs } from './useVectorSnapshotsRefs';

describe('useVectorSnapshotsRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useVectorSnapshotsRefs());

    // result
    expect(result.current).toEqual({
      draggedVectorFillFacesRef: { current: null },
      draggedVectorNodeSnapshotsRef: { current: null },
      resizedVectorNodeSnapshotsRef: { current: null },
      rotatedVectorNodeSnapshotsRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useVectorSnapshotsRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.draggedVectorNodeSnapshotsRef).toBe(firstRefs.draggedVectorNodeSnapshotsRef);
  });
});
