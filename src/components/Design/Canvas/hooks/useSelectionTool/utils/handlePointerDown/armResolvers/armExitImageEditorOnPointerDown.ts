// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';

export const armExitImageEditorOnPointerDown = ({ dispatch, hit }: TArmContext): true | undefined => {
  const imageEditor = selectImageEditor(store.getState());

  if (!hit && imageEditor) {
    dispatch(setImageEditor(null));

    return true;
  }
};
