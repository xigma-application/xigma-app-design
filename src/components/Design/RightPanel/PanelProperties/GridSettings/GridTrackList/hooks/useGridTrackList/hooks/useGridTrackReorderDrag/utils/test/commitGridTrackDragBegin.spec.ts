import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// utils
import { commitGridTrackDragBegin } from '../commitGridTrackDragBegin';

const pointerEvent = (): ReactPointerEvent => ({ preventDefault: vi.fn() }) as unknown as ReactPointerEvent;

describe('commitGridTrackDragBegin', () => {
  it('should block the default and start the drag state unmoved, anchored on the first source index', () => {
    const dropIndexRef: RefObject<number> = { current: 0 };
    const setDragState = vi.fn();
    const event = pointerEvent();

    commitGridTrackDragBegin(dropIndexRef, setDragState, [2, 3], 2, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(dropIndexRef.current).toBe(2);
    expect(setDragState).toHaveBeenCalledWith({ dropIndex: 2, grabbedIndex: 2, hasMoved: false, sourceIndices: [2, 3] });
  });
});
