import { RefObject } from 'react';

// utils
import { syncSuppressedGridTrackSelection } from '../syncSuppressedGridTrackSelection';

const ref = (initial: boolean): RefObject<boolean> => ({ current: initial });

describe('syncSuppressedGridTrackSelection', () => {
  it('should clear the selection on a genuine transition into suppressed', () => {
    const clearSelection = vi.fn();
    const lastIsSuppressedRef = ref(false);

    syncSuppressedGridTrackSelection(true, clearSelection, lastIsSuppressedRef);

    expect(clearSelection).toHaveBeenCalled();
    expect(lastIsSuppressedRef.current).toBe(true);
  });

  it('should leave the selection untouched when the axis is not suppressed', () => {
    const clearSelection = vi.fn();
    const lastIsSuppressedRef = ref(false);

    syncSuppressedGridTrackSelection(false, clearSelection, lastIsSuppressedRef);

    expect(clearSelection).not.toHaveBeenCalled();
    expect(lastIsSuppressedRef.current).toBe(false);
  });

  it('should not re-clear when invoked again with the already-recorded suppressed value (e.g. a StrictMode double-invoke replay)', () => {
    // a second invocation with the same "still suppressed" value must not blindly clear again — a
    // sibling axis's own selection effect may have legitimately re-selected in between
    const clearSelection = vi.fn();
    const lastIsSuppressedRef = ref(true);

    syncSuppressedGridTrackSelection(true, clearSelection, lastIsSuppressedRef);

    expect(clearSelection).not.toHaveBeenCalled();
  });

  it('should record the latest suppressed value even when it is false', () => {
    const clearSelection = vi.fn();
    const lastIsSuppressedRef = ref(true);

    syncSuppressedGridTrackSelection(false, clearSelection, lastIsSuppressedRef);

    expect(lastIsSuppressedRef.current).toBe(false);
  });
});
