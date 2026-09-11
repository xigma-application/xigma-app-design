// store
import { AppDispatch } from 'store';
import { setGridTrackSelection, setPanelGridTrackSelection } from 'store/design/slice';

// types
import { TGridTrackSelection } from 'types/design/canvas/types';

export const publishGridTrackSelection = (dispatch: AppDispatch, selection: TGridTrackSelection | null): void => {
  dispatch(setGridTrackSelection(selection));
  dispatch(setPanelGridTrackSelection(selection));
};
