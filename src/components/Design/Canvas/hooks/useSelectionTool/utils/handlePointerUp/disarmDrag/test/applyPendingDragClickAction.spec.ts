// store
import { setSelection } from 'store/design/slice';

// types
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { applyPendingDragClickAction } from '../applyPendingDragClickAction';

const run = (pendingClickAction: unknown, hasMoved = false): TFunc => {
  const dispatch = vi.fn();
  applyPendingDragClickAction(dispatch, { hasMoved, pendingClickAction } as TDragState);
  return dispatch;
};

describe('applyPendingDragClickAction', () => {
  it('should collapse the selection to the clicked layer on a click without movement', () => {
    // result
    expect(run({ id: 'a', kind: 'collapse' })).toHaveBeenCalledWith(setSelection(['a']));
  });

  it('should clear the selection on a deselecting click without movement', () => {
    // result
    expect(run({ kind: 'deselect' })).toHaveBeenCalledWith(setSelection([]));
  });

  it('should do nothing after a real drag or without a pending action', () => {
    // result
    expect(run({ id: 'a', kind: 'collapse' }, true)).not.toHaveBeenCalled();
    expect(run({ kind: 'deselect' }, true)).not.toHaveBeenCalled();
    expect(run(null)).not.toHaveBeenCalled();
  });
});
