import { MouseEvent } from 'react';

// store
import { selectOrderedNodes, selectSelectedIds } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { getRangeSelectionIds } from './utils/getRangeSelectionIds';
import { getSelectionAnchorId, setSelectionAnchorId } from './utils/selectionAnchor';
import { getToggledSelectionIds } from './utils/getToggledSelectionIds';

export const useSelectTreeItem = (id: string): TFunc<[MouseEvent]> => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectOrderedNodes);
  const selectedIds = useAppSelector(selectSelectedIds);

  return (event: MouseEvent): void => {
    if (event.shiftKey) {
      const orderedIds = nodes.map((node) => node.id);

      dispatch(setSelection(getRangeSelectionIds(orderedIds, getSelectionAnchorId() ?? id, id)));
    } else if (event.ctrlKey || event.metaKey) {
      setSelectionAnchorId(id);
      dispatch(setSelection(getToggledSelectionIds(selectedIds, id)));
    } else {
      setSelectionAnchorId(id);
      dispatch(setSelection([id]));
    }
  };
};
