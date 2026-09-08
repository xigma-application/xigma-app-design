import { MouseEvent } from 'react';

// hooks
import { useTreeVisibleOrder } from 'shared/UI/Tree/hooks/useTreeVisibleOrder/useTreeVisibleOrder';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { getRangeSelectionIds } from './utils/getRangeSelectionIds';
import { getSelectionAnchorId, setSelectionAnchorId } from './utils/selectionAnchor';
import { getToggledSelectionIds } from './utils/getToggledSelectionIds';

export const useSelectTreeItem = (id: string): TFunc<[MouseEvent]> => {
  const dispatch = useAppDispatch();
  const visibleOrderIds = useTreeVisibleOrder();
  const selectedIds = useAppSelector(selectSelectedIds);

  return (event: MouseEvent): void => {
    if (event.shiftKey) {
      dispatch(setSelection(getRangeSelectionIds(visibleOrderIds, getSelectionAnchorId() ?? id, id)));
    } else if (event.ctrlKey || event.metaKey) {
      setSelectionAnchorId(id);
      dispatch(setSelection(getToggledSelectionIds(selectedIds, id)));
    } else {
      setSelectionAnchorId(id);
      dispatch(setSelection([id]));
    }
  };
};
