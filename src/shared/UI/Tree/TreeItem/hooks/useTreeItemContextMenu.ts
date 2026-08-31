// hooks
import { TUseContextMenuResult, useContextMenu } from '../../hooks/useContextMenu';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { setSelectionAnchorId } from './useSelectTreeItem/utils/selectionAnchor';

export type TUseTreeItemContextMenuResult = TUseContextMenuResult;

export const useTreeItemContextMenu = (id: string): TUseTreeItemContextMenuResult => {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);

  const selectIfNotSelected = (): void => {
    if (!selectedIds.includes(id)) {
      setSelectionAnchorId(id);
      dispatch(setSelection([id]));
    }
  };

  return useContextMenu(selectIfNotSelected);
};
