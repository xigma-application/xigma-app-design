// store
import { setSelection } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TDragState } from 'types/design/selectionTool/types';

export const applyPendingDragClickAction = (dispatch: AppDispatch, dragState: TDragState): void => {
  const { hasMoved, pendingClickAction } = dragState;

  if (pendingClickAction?.kind === 'collapse' && !hasMoved) {
    dispatch(setSelection([pendingClickAction.id]));
  } else if (pendingClickAction?.kind === 'deselect' && !hasMoved) {
    dispatch(setSelection([]));
  }
};
