// store
import { redo } from 'store/history/actions';
import { applyVectorSelectionSnapshot } from 'store/history/applyVectorSelectionSnapshot';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const handleRedo = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const restoredVectorSelection = dispatch(redo(getVectorSelectionSnapshot(refs)));

  if (restoredVectorSelection) {
    applyVectorSelectionSnapshot(refs, restoredVectorSelection);
  }
};
