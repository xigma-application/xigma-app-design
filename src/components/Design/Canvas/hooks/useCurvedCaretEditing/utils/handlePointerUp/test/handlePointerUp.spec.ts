import { RefObject } from 'react';

// utils
import { handlePointerUp } from '../handlePointerUp';

describe('handlePointerUp', () => {
  it('should clear the anchor index and disarm the offset drag', () => {
    // mock
    const anchorIndexRef: RefObject<number | null> = { current: 3 };
    const isDraggingOffsetRef: RefObject<boolean> = { current: true };

    // before
    handlePointerUp(anchorIndexRef, isDraggingOffsetRef);

    // result
    expect(anchorIndexRef.current).toBeNull();
    expect(isDraggingOffsetRef.current).toBe(false);
  });
});
