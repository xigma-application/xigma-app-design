// store
import { selectImageEditor, selectImageFillPickerFocus } from 'store/design/selectors';
import { setImageEditor, setImageFillPickerFocus } from 'store/design/slice';
import { AppDispatch, store } from 'store';

export const clearOwnedImageEditorState = (dispatch: AppDispatch, nodeId: string | undefined, paintIndex: number): void => {
  const currentImageEditor = selectImageEditor(store.getState());
  const currentFocus = selectImageFillPickerFocus(store.getState());

  if (currentImageEditor && currentImageEditor.nodeId === nodeId && currentImageEditor.paintIndex === paintIndex) {
    dispatch(setImageEditor(null));
  }

  if (currentFocus && currentFocus.nodeId === nodeId && currentFocus.paintIndex === paintIndex) {
    dispatch(setImageFillPickerFocus(null));
  }
};
