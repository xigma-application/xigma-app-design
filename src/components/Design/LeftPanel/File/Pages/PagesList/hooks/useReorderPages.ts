// store
import { reorderPages } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useReorderPages = (): TFunc<[number, number]> => {
  const dispatch = useAppDispatch();

  return (fromIndex: number, toIndex: number): void => {
    dispatch(reorderPages({ fromIndex, toIndex }));
  };
};
