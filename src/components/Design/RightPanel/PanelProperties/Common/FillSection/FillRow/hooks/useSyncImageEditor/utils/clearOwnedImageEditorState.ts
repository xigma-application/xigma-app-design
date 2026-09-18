// store
import { selectImageEditor, selectImageFillPickerFocus } from 'store/design/selectors';
import { setImageEditor, setImageFillPickerFocus } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const clearOwnedImageEditorState = (
  dispatch: AppDispatch,
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty = 'fills',
): void => {
  const currentImageEditor = selectImageEditor(store.getState());
  const currentFocus = selectImageFillPickerFocus(store.getState());

  if (
    currentImageEditor &&
    currentImageEditor.nodeId === nodeId &&
    currentImageEditor.paintIndex === paintIndex &&
    (currentImageEditor.property ?? 'fills') === property
  ) {
    dispatch(setImageEditor(null));
  }

  if (
    currentFocus &&
    currentFocus.nodeId === nodeId &&
    currentFocus.paintIndex === paintIndex &&
    (currentFocus.property ?? 'fills') === property
  ) {
    dispatch(setImageFillPickerFocus(null));
  }
};
