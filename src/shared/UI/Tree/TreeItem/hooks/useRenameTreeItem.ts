// store
import { updateNode } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useRenameTreeItem = (id: string): TFunc<[string]> => {
  const dispatch = useAppDispatch();

  return (name: string): void => {
    dispatch(updateNode({ changes: { name }, id }));
  };
};
