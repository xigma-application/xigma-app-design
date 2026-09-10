import { RefObject } from 'react';

// hooks
import { TGridTrackDragState } from '../../useGridTrackReorderDrag';

// utils
import { commitGridTrackDragMove } from '../commitGridTrackDragMove';

const rowAt = (top: number): HTMLElement => ({ getBoundingClientRect: () => ({ height: 20, top }) }) as unknown as HTMLElement;

const dragState: TGridTrackDragState = { dropIndex: 0, grabbedIndex: 0, hasMoved: false, sourceIndices: [0] };

describe('commitGridTrackDragMove', () => {
  it('should compute the drop index from the pointer position and flag the drag as moved', () => {
    const rowsRef: RefObject<Map<number, HTMLElement>> = {
      current: new Map([
        [0, rowAt(0)],
        [1, rowAt(20)],
      ]),
    };
    const dropIndexRef: RefObject<number> = { current: 0 };
    const setDragState = vi.fn();

    commitGridTrackDragMove({ clientY: 25 } as PointerEvent, 2, rowsRef, dropIndexRef, dragState, setDragState);

    expect(dropIndexRef.current).toBe(1);
    expect(setDragState).toHaveBeenCalledWith({ ...dragState, dropIndex: 1, hasMoved: true });
  });
});
