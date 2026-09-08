// store
import { removeNodeMask } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useRemoveNodeMask = (id: string): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    dispatch(removeNodeMask(id));
  };
};
