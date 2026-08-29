// store
import { setSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

// utils
import { setSelectionAnchorId } from 'shared/UI/Tree/TreeItem/hooks/useSelectTreeItem/utils/selectionAnchor';

export const useDeselectOnEmptyClick = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    setSelectionAnchorId(null);
    dispatch(setSelection([]));
  };
};
