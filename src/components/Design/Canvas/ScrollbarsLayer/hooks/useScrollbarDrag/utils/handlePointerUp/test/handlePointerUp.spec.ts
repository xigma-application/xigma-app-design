// utils
import { handlePointerUp } from '../handlePointerUp';

describe('handlePointerUp', () => {
  it('should end the thumb drag, unfreeze the range and release the pointer', () => {
    // mock
    const thumb = { releasePointerCapture: vi.fn() } as unknown as HTMLDivElement;
    const anchorRef = { current: {} as never };
    const frozenRangeRef = { current: { rangeLength: 5 } };
    const draggingRef = { current: true };

    // before
    handlePointerUp(thumb, { pointerId: 2 } as PointerEvent, frozenRangeRef, draggingRef, anchorRef);

    // result
    expect(anchorRef.current).toBeNull();
    expect(frozenRangeRef.current).toBeNull();
    expect(draggingRef.current).toBe(false);
    expect(thumb.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
