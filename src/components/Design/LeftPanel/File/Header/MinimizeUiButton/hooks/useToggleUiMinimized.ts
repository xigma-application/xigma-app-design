// store
import { toggleUiMinimized } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useToggleUiMinimized = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    dispatch(toggleUiMinimized());
  };
};
