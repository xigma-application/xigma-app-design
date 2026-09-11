import { RefObject } from 'react';

// utils
import { commitGridTrackSelectionClear } from '../commitGridTrackSelectionClear';

describe('commitGridTrackSelectionClear', () => {
  it('should reset the anchor and clear the selection', () => {
    const setSelection = vi.fn();
    const anchorRef: RefObject<number | null> = { current: 1 };

    commitGridTrackSelectionClear(anchorRef, setSelection);

    expect(anchorRef.current).toBeNull();
    expect(setSelection).toHaveBeenCalledWith([]);
  });
});
