import { RefObject } from 'react';

// hooks
import { TGridTrackDragState } from '../../useGridTrackReorderDrag';

// utils
import { commitGridTrackDragEnd } from '../commitGridTrackDragEnd';

describe('commitGridTrackDragEnd', () => {
  it('should commit the reorder with the final drop index and clear the drag state', () => {
    const dragState: TGridTrackDragState = { dropIndex: 2, grabbedIndex: 0, hasMoved: true, sourceIndices: [0] };
    const dropIndexRef: RefObject<number> = { current: 2 };
    const onReorder = vi.fn(() => true);
    const setDragState = vi.fn();

    commitGridTrackDragEnd(dragState, dropIndexRef, onReorder, setDragState);

    expect(onReorder).toHaveBeenCalledWith([0], 2, 0, true);
    expect(setDragState).toHaveBeenCalledWith(null);
  });
});
