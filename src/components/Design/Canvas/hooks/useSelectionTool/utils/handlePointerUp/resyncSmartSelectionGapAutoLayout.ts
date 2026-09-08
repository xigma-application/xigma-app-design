// store
import { AppDispatch } from 'store';

// types
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { resyncGroupAutoLayoutAncestors } from './resyncGroupAutoLayoutAncestors';

export const resyncSmartSelectionGapAutoLayout = (dispatch: AppDispatch, dragState: TSmartSelectionGapDragState): void => {
  resyncGroupAutoLayoutAncestors(dispatch, Object.keys(dragState.nodeOrigins));
};
