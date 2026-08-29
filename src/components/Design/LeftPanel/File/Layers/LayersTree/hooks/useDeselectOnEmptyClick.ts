// store
import { setSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useDeselectOnEmptyClick = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    dispatch(setSelection([]));
  };
};
