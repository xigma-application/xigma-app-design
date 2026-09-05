// types
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { markDragAsMoved } from '../markDragAsMoved';

describe('markDragAsMoved', () => {
  it('should flip hasMoved to true', () => {
    const dragState = { hasMoved: false } as TDragState;

    markDragAsMoved(dragState);

    expect(dragState.hasMoved).toBe(true);
  });
});
