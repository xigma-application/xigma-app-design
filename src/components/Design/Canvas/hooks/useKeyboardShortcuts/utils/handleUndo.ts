// store
import { AppDispatch } from 'store';
import { applyVectorSelectionSnapshot } from 'store/history/applyVectorSelectionSnapshot';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { undo } from 'store/history/actions';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const handleUndo = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const restoredVectorSelection = dispatch(undo(getVectorSelectionSnapshot(refs)));

  if (restoredVectorSelection) {
    applyVectorSelectionSnapshot(refs, restoredVectorSelection);
  }
};
