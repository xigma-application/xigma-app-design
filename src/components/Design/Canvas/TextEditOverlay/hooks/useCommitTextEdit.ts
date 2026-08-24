import { FocusEvent, RefObject } from 'react';

// store
import { deleteNode, setSelection, stopTextEdit } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { useAppDispatch, useAppStore } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { commitTextNode } from '../utils/commitTextNode';
import { getEditableTextContent } from '../utils/getEditableTextContent';
import { selectCommittedNode } from '../utils/selectCommittedNode';

export const useCommitTextEdit = (
  box: TEditingTextBox | null,
  editingNodeId: string | null,
  selectOnCommitRef: RefObject<boolean>,
): ((event: FocusEvent<HTMLDivElement>) => void) => {
  const dispatch = useAppDispatch();
  const appStore = useAppStore();

  return (event: FocusEvent<HTMLDivElement>): void => {
    if (box) {
      const content = getEditableTextContent(event.currentTarget);
      const selectOnCommit = selectOnCommitRef.current;

      selectOnCommitRef.current = false;
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));

      if (content.length > 0) {
        commitTextNode(dispatch, box, editingNodeId, content);

        if (selectOnCommit) {
          selectCommittedNode(dispatch, appStore, editingNodeId);
        } else {
          dispatch(setSelection([]));
        }
      } else {
        if (editingNodeId) {
          dispatch(deleteNode(editingNodeId));
        }

        dispatch(setSelection([]));
      }

      dispatch(endHistoryGesture());
      dispatch(stopTextEdit());
    }
  };
};
