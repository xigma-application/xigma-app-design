import { KeyboardEvent } from 'react';

// store
import { updateTextEditContent, updateTextEditSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { getEditableSelectionOffsets } from '../utils/getEditableSelectionOffsets';
import { getEditableTextContent } from '../utils/getEditableTextContent';
import { insertTextAtCaret } from '../utils/insertTextAtCaret';

export const useBlockShortcutPropagation = (box: TEditingTextBox | null): ((event: KeyboardEvent<HTMLDivElement>) => void) => {
  const dispatch = useAppDispatch();

  return (event: KeyboardEvent<HTMLDivElement>): void => {
    event.stopPropagation();

    if (box?.pathId && event.key === 'Enter') {
      event.preventDefault();
      insertTextAtCaret(event.currentTarget, ' ');
      dispatch(updateTextEditContent(getEditableTextContent(event.currentTarget)));
      dispatch(updateTextEditSelection(getEditableSelectionOffsets(event.currentTarget)));
    }
  };
};
