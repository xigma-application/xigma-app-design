// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { handleZoomToPercentage } from './handleZoomToPercentage';

export const handleZoomTo100 = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  handleZoomToPercentage(dispatch, refs, 1);
};
