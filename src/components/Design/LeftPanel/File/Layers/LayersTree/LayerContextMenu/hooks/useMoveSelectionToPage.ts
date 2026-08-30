// store
import { moveNodesToPage } from 'store/design/slice';
import { selectSelectedIds } from 'store/design/selectors';
import { store, useAppDispatch } from 'store';

export const useMoveSelectionToPage = (): TFunc<[string]> => {
  const dispatch = useAppDispatch();

  return (targetPageId: string): void => {
    const nodeIds = selectSelectedIds(store.getState());

    if (nodeIds.length > 0) {
      dispatch(moveNodesToPage({ nodeIds, targetPageId }));
    }
  };
};
