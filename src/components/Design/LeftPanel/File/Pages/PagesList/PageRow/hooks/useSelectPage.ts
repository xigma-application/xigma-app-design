// store
import { setActivePage } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useSelectPage = (id: string): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    dispatch(setActivePage(id));
  };
};
