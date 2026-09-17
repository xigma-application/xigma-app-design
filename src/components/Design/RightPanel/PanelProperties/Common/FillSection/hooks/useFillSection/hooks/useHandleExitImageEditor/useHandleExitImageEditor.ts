import { useCallback } from 'react';

// store
import { setImageEditor } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useHandleExitImageEditor = (): TFunc => {
  const dispatch = useAppDispatch();

  return useCallback((): void => {
    dispatch(setImageEditor(null));
  }, [dispatch]);
};
