// store
import { reorderPages } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useReorderPages = (): TFunc<[number[], number]> => {
  const dispatch = useAppDispatch();

  return ([fromIndex], toIndex: number): void => {
    if (fromIndex !== undefined) {
      dispatch(reorderPages({ fromIndex, toIndex }));
    }
  };
};
