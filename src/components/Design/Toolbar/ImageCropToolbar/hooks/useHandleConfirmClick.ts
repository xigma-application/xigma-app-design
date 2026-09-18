import { useCallback } from 'react';

// store
import { setImageEditor } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useHandleConfirmClick = (): TFunc => {
  const dispatch = useAppDispatch();

  return useCallback((): void => {
    dispatch(setImageEditor(null));
  }, [dispatch]);
};
