// store
import { reorderNode } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useReorderNode = (): TFunc<[number[], number]> => {
  const dispatch = useAppDispatch();

  return (fromIndices: number[], toIndex: number): void => {
    dispatch(reorderNode({ fromIndices, toIndex }));
  };
};
