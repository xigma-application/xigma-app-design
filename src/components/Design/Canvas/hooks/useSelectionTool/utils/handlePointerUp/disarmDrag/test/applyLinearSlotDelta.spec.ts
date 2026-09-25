// store
import { moveNodes } from 'store/design/slice';

// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../../handlePointerMove/continueDrag/updateDragDropTarget/types';

// utils
import { applyLinearSlotDelta } from '../applyLinearSlotDelta';

const frame = (layoutMode: LayoutMode): TAutoLayoutFrame =>
  ({ childIds: ['a', 'b', 'c'], id: 'f', layoutMode }) as unknown as TAutoLayoutFrame;

describe('applyLinearSlotDelta', () => {
  it('should move the dragged layers by the given steps', () => {
    // mock
    const dispatch = vi.fn();

    // before
    applyLinearSlotDelta(dispatch, frame(LayoutMode.horizontal), ['a'], { steps: 1, x: 0, y: 0 });

    // result
    expect(dispatch).toHaveBeenCalledWith(moveNodes({ nodeIds: ['a'], targetIndex: 1, targetParentId: 'f' }));
  });

  it('should fall back to the flow axis offset and clamp to the row', () => {
    // mock
    const dispatch = vi.fn();

    // before
    applyLinearSlotDelta(dispatch, frame(LayoutMode.horizontal), ['a'], { steps: null, x: 9, y: 0 });
    applyLinearSlotDelta(dispatch, frame(LayoutMode.vertical), ['c'], { steps: null, x: 0, y: -9 });

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, moveNodes({ nodeIds: ['a'], targetIndex: 2, targetParentId: 'f' }));
    expect(dispatch).toHaveBeenNthCalledWith(2, moveNodes({ nodeIds: ['c'], targetIndex: 0, targetParentId: 'f' }));
  });

  it('should do nothing when the layers stay in place', () => {
    // mock
    const dispatch = vi.fn();

    // before
    applyLinearSlotDelta(dispatch, frame(LayoutMode.vertical), ['b'], { steps: null, x: 5, y: 0 });

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
