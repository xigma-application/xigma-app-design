// store
import { renamePage } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useRenamePage = (id: string): TFunc<[string]> => {
  const dispatch = useAppDispatch();

  return (name: string): void => {
    dispatch(renamePage({ id, name }));
  };
};
