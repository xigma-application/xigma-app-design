import { RefObject } from 'react';

// utils
import { handlePointerUp } from '../handlePointerUp';

describe('handlePointerUp', () => {
  it('should clear the anchor index and disarm the offset drag', () => {
    // mock
    const anchorIndexRef: RefObject<number | null> = { current: 3 };
    const isDraggingOffsetRef: RefObject<boolean> = { current: true };
    const setClassName = vi.fn();

    // before
    handlePointerUp(anchorIndexRef, isDraggingOffsetRef, setClassName);

    // result
    expect(anchorIndexRef.current).toBeNull();
    expect(isDraggingOffsetRef.current).toBe(false);
    expect(setClassName).toHaveBeenCalledWith('hand');
  });

  it('should leave the cursor untouched when no offset drag was in progress', () => {
    // mock
    const anchorIndexRef: RefObject<number | null> = { current: 3 };
    const isDraggingOffsetRef: RefObject<boolean> = { current: false };
    const setClassName = vi.fn();

    // before
    handlePointerUp(anchorIndexRef, isDraggingOffsetRef, setClassName);

    // result
    expect(anchorIndexRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });
});
