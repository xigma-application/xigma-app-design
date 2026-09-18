import { useCallback } from 'react';

// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor, updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

export const useHandleCancelClick = (): TFunc => {
  const dispatch = useAppDispatch();
  const imageEditor = useAppSelector(selectImageEditor);

  return useCallback((): void => {
    if (imageEditor?.mode === 'crop' && imageEditor.cropCancelSnapshot) {
      dispatch(updateNode({ changes: imageEditor.cropCancelSnapshot, id: imageEditor.nodeId }));
    }

    dispatch(setImageEditor(null));
  }, [dispatch, imageEditor]);
};
