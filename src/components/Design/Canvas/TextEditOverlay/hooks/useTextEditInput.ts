import { InputEvent } from 'react';

// store
import { updateTextEditContent, updateTextEditSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

// utils
import { getEditableSelectionOffsets } from '../utils/getEditableSelectionOffsets';
import { getEditableTextContent } from '../utils/getEditableTextContent';

export const useTextEditInput = (): ((event: InputEvent<HTMLDivElement>) => void) => {
  const dispatch = useAppDispatch();

  return (event: InputEvent<HTMLDivElement>): void => {
    dispatch(updateTextEditContent(getEditableTextContent(event.currentTarget)));
    dispatch(updateTextEditSelection(getEditableSelectionOffsets(event.currentTarget)));
  };
};
