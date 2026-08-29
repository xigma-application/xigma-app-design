// store
import { deletePage } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useDeletePage = (id: string): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    dispatch(deletePage(id));
  };
};
