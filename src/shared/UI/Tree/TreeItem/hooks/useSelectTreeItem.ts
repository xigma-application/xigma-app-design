// store
import { setSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useSelectTreeItem = (id: string): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    dispatch(setSelection([id]));
  };
};
