import { SyntheticEvent } from 'react';

// store
import { updateTextEditSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

// utils
import { getEditableSelectionOffsets } from '../utils/getEditableSelectionOffsets';

export const useTrackTextEditSelection = (): ((event: SyntheticEvent<HTMLDivElement>) => void) => {
  const dispatch = useAppDispatch();

  return (event: SyntheticEvent<HTMLDivElement>): void => {
    dispatch(updateTextEditSelection(getEditableSelectionOffsets(event.currentTarget)));
  };
};
