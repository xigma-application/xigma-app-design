import { FocusEvent } from 'react';

// store
import { setSelection, stopTextEdit } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { commitTextNode } from '../utils/commitTextNode';
import { getEditableTextContent } from '../utils/getEditableTextContent';

export const useCommitTextEdit = (
  box: TEditingTextBox | null,
  editingNodeId: string | null,
): ((event: FocusEvent<HTMLDivElement>) => void) => {
  const dispatch = useAppDispatch();

  return (event: FocusEvent<HTMLDivElement>): void => {
    if (box) {
      const content = getEditableTextContent(event.currentTarget);

      if (content.length > 0) {
        commitTextNode(dispatch, box, editingNodeId, content);
      }

      dispatch(setSelection([]));
      dispatch(stopTextEdit());
    }
  };
};
