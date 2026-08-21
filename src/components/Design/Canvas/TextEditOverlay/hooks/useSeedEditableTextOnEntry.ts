import { RefObject, useEffect, useRef } from 'react';

// store
import { updateTextEditSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { selectEditableTextContent } from '../utils/selectEditableTextContent';
import { setEditableTextContent } from '../utils/setEditableTextContent';

export const useSeedEditableTextOnEntry = (
  elementRef: RefObject<HTMLDivElement | null>,
  box: TEditingTextBox | null,
  editingNodeId: string | null,
  editingTextContent: string,
): void => {
  const editingTextContentRef = useRef(editingTextContent);
  editingTextContentRef.current = editingTextContent;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (box && elementRef.current) {
      const element = elementRef.current;

      if (editingNodeId) {
        setEditableTextContent(element, editingTextContentRef.current);
      }

      element.focus();

      if (editingNodeId) {
        selectEditableTextContent(element);
        dispatch(updateTextEditSelection({ end: editingTextContentRef.current.length, start: 0 }));
      }
    }
  }, [box, dispatch, editingNodeId, elementRef]);
};
